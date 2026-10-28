package main

import (
	"context"
	_ "embed"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"slices"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/lenaimdahl/atelier/backend/models"
)

//go:embed catalog/books.txt
var catalogFile string

// Open Library asks clients to identify themselves.
const userAgent = "atelier-showcase/0.1 (https://github.com/lenaimdahl/atelier)"

const openLibrarySearchURL = "https://openlibrary.org/search.json"

type catalogEntry struct {
	id       string
	language models.BookLanguage
	title    string
}

// parseCatalog reads lines of the form "<work ID> <language> <title> | <author>".
// The author after "|" is only a reading aid; the imported author comes from Open Library.
func parseCatalog(file string) ([]catalogEntry, error) {
	var entries []catalogEntry
	for number, line := range strings.Split(file, "\n") {
		line, _, _ = strings.Cut(line, "|")
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}

		fields := strings.SplitN(line, " ", 3)
		if len(fields) != 3 {
			return nil, fmt.Errorf("line %d: expected \"<id> <language> <title>\"", number+1)
		}
		language := models.BookLanguage(fields[1])
		if language != models.BookLanguageEn && language != models.BookLanguageDe {
			return nil, fmt.Errorf("line %d: unknown language %q", number+1, fields[1])
		}
		entries = append(entries, catalogEntry{id: fields[0], language: language, title: strings.TrimSpace(fields[2])})
	}
	return entries, nil
}

// importCatalogWithRetry keeps retrying when Open Library is unreachable, so the library
// does not stay empty until the next restart.
func importCatalogWithRetry(ctx context.Context, database *pgxpool.Pool, client *http.Client) {
	delay := 10 * time.Second
	for attempt := 1; ; attempt++ {
		err := importCatalog(ctx, database, client)
		if err == nil {
			return
		}
		log.Printf("catalog import attempt %d failed: %v", attempt, err)
		if attempt == 5 {
			return
		}

		select {
		case <-ctx.Done():
			return
		case <-time.After(delay):
		}
		delay *= 3
	}
}

func importCatalog(ctx context.Context, database *pgxpool.Pool, client *http.Client) error {
	entries, err := parseCatalog(catalogFile)
	if err != nil {
		return err
	}

	ids := make([]string, len(entries))
	for i, entry := range entries {
		ids[i] = entry.id
	}

	// Books removed from the list disappear from the library and the shelf.
	removed, err := database.Exec(ctx, `DELETE FROM catalog_books WHERE id <> ALL($1)`, ids)
	if err != nil {
		return err
	}
	if removed.RowsAffected() > 0 {
		log.Printf("removed %d books that are no longer in the catalog", removed.RowsAffected())
	}

	// Title and language are curated in books.txt, so corrections apply on every start.
	for _, entry := range entries {
		if _, err := database.Exec(ctx, `UPDATE catalog_books SET title = $2, language = $3 WHERE id = $1`, entry.id, entry.title, entry.language); err != nil {
			return err
		}
	}

	rows, err := database.Query(ctx, `SELECT id FROM catalog_books WHERE id = ANY($1) AND cover_image IS NOT NULL`, ids)
	if err != nil {
		return err
	}
	complete, err := pgx.CollectRows(rows, pgx.RowTo[string])
	if err != nil {
		return err
	}

	var missing []catalogEntry
	for _, entry := range entries {
		if !slices.Contains(complete, entry.id) {
			missing = append(missing, entry)
		}
	}
	if len(missing) == 0 {
		log.Printf("catalog up to date with %d books", len(entries))
		return nil
	}

	missingIDs := make([]string, len(missing))
	for i, entry := range missing {
		missingIDs[i] = entry.id
	}
	works, err := fetchOpenLibraryWorks(ctx, client, missingIDs)
	if err != nil {
		return fmt.Errorf("open library: %w", err)
	}

	var imported int
	for _, entry := range missing {
		work, ok := works[entry.id]
		if !ok || len(work.AuthorName) == 0 || work.CoverID <= 0 {
			log.Printf("skipping %s: no author or cover in Open Library", entry.id)
			continue
		}

		cover, err := fetchCover(ctx, client, work.CoverID)
		if err != nil {
			log.Printf("skipping %s: %v", entry.id, err)
			continue
		}

		_, err = database.Exec(ctx, `
			INSERT INTO catalog_books (id, title, author, language, cover_image)
			VALUES ($1, $2, $3, $4, $5)
			ON CONFLICT (id) DO UPDATE SET
				title = EXCLUDED.title,
				author = EXCLUDED.author,
				language = EXCLUDED.language,
				cover_image = EXCLUDED.cover_image,
				imported_at = NOW()
		`, entry.id, entry.title, work.AuthorName[0], entry.language, cover)
		if err != nil {
			return err
		}
		imported++
	}

	log.Printf("imported %d of %d missing catalog books from Open Library", imported, len(missing))
	if imported < len(missing) {
		return fmt.Errorf("%d books could not be imported", len(missing)-imported)
	}
	return nil
}

type openLibraryWork struct {
	Key        string   `json:"key"`
	AuthorName []string `json:"author_name"`
	CoverID    int      `json:"cover_i"`
}

// fetchOpenLibraryWorks looks up all works with a single search request, keyed by work ID.
func fetchOpenLibraryWorks(ctx context.Context, client *http.Client, ids []string) (map[string]openLibraryWork, error) {
	query := url.Values{
		"q":      {"key:(/works/" + strings.Join(ids, " OR /works/") + ")"},
		"fields": {"key,author_name,cover_i"},
		"limit":  {fmt.Sprint(len(ids))},
	}
	body, err := download(ctx, client, openLibrarySearchURL+"?"+query.Encode(), 1<<20)
	if err != nil {
		return nil, err
	}
	return parseOpenLibraryWorks(body)
}

func fetchCover(ctx context.Context, client *http.Client, coverID int) ([]byte, error) {
	cover, err := download(ctx, client, fmt.Sprintf("https://covers.openlibrary.org/b/id/%d-M.jpg", coverID), 1<<20)
	if err != nil {
		return nil, fmt.Errorf("cover: %w", err)
	}
	if http.DetectContentType(cover) != "image/jpeg" {
		return nil, fmt.Errorf("cover %d is not a JPEG image", coverID)
	}
	return cover, nil
}

// download rejects responses larger than maxBytes instead of reading them into memory.
func download(ctx context.Context, client *http.Client, url string, maxBytes int64) ([]byte, error) {
	request, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}
	request.Header.Set("User-Agent", userAgent)

	response, err := client.Do(request)
	if err != nil {
		return nil, err
	}
	defer response.Body.Close()

	if response.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("%s returned %s", request.URL.Host, response.Status)
	}
	body, err := io.ReadAll(io.LimitReader(response.Body, maxBytes+1))
	if err != nil {
		return nil, err
	}
	if int64(len(body)) > maxBytes {
		return nil, fmt.Errorf("%s returned more than %d bytes", request.URL.Host, maxBytes)
	}
	return body, nil
}

func parseOpenLibraryWorks(body []byte) (map[string]openLibraryWork, error) {
	var result struct {
		Docs []openLibraryWork `json:"docs"`
	}
	if err := json.Unmarshal(body, &result); err != nil {
		return nil, err
	}

	works := map[string]openLibraryWork{}
	for _, work := range result.Docs {
		works[strings.TrimPrefix(work.Key, "/works/")] = work
	}
	return works, nil
}

const maxSearchLength = 100

func searchCatalogHandler(database *pgxpool.Pool, allowedOrigin string) http.HandlerFunc {
	return func(response http.ResponseWriter, request *http.Request) {
		setCORSHeaders(response, allowedOrigin)

		query := strings.TrimSpace(request.URL.Query().Get("q"))
		if len(query) > maxSearchLength {
			writeJSONError(response, http.StatusBadRequest, "q is too long")
			return
		}
		language := request.URL.Query().Get("language")
		if language != "" && language != string(models.BookLanguageEn) && language != string(models.BookLanguageDe) {
			writeJSONError(response, http.StatusBadRequest, "language must be en or de")
			return
		}

		rows, err := database.Query(request.Context(), `
			SELECT id, title, author, language
			FROM catalog_books
			WHERE ($1 = '' OR title ILIKE '%' || $1 || '%' OR author ILIKE '%' || $1 || '%')
				AND ($2 = '' OR language = $2)
			ORDER BY title
			LIMIT 20
		`, query, language)
		if err != nil {
			log.Printf("could not search catalog: %v", err)
			writeJSONError(response, http.StatusInternalServerError, "could not search catalog")
			return
		}
		defer rows.Close()

		books := []models.Book{}
		for rows.Next() {
			var book models.Book
			if err := rows.Scan(&book.ID, &book.Title, &book.Author, &book.Language); err != nil {
				log.Printf("could not read catalog book: %v", err)
				writeJSONError(response, http.StatusInternalServerError, "could not search catalog")
				return
			}
			book.CoverUrl = coverPath(book.ID)
			books = append(books, book)
		}
		if err := rows.Err(); err != nil {
			log.Printf("could not read catalog: %v", err)
			writeJSONError(response, http.StatusInternalServerError, "could not search catalog")
			return
		}

		writeJSON(response, http.StatusOK, books)
	}
}

// coverPath is relative to the API base URL. Covers are served by the backend itself, so
// visitors' browsers never contact Open Library.
func coverPath(bookID string) *string {
	path := "/covers/" + bookID
	return &path
}

func coverHandler(database *pgxpool.Pool) http.HandlerFunc {
	return func(response http.ResponseWriter, request *http.Request) {
		var cover []byte
		err := database.QueryRow(request.Context(), `SELECT cover_image FROM catalog_books WHERE id = $1 AND cover_image IS NOT NULL`, request.PathValue("id")).Scan(&cover)
		if err == pgx.ErrNoRows {
			http.NotFound(response, request)
			return
		}
		if err != nil {
			log.Printf("could not load cover: %v", err)
			http.Error(response, "could not load cover", http.StatusInternalServerError)
			return
		}

		response.Header().Set("Content-Type", "image/jpeg")
		response.Header().Set("Cache-Control", "public, max-age=86400")
		_, _ = response.Write(cover)
	}
}
