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
	"strings"

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

	var imported int
	if err := database.QueryRow(ctx, `SELECT COUNT(*) FROM catalog_books WHERE id = ANY($1)`, ids).Scan(&imported); err != nil {
		return err
	}
	if imported == len(ids) {
		log.Printf("catalog up to date with %d books", imported)
		return nil
	}

	works, err := fetchOpenLibraryWorks(ctx, client, ids)
	if err != nil {
		return fmt.Errorf("open library: %w", err)
	}
	// The import runs again on the next start, because the catalog is still incomplete.
	if len(works) == 0 {
		return fmt.Errorf("open library returned no books")
	}

	for _, entry := range entries {
		work, ok := works[entry.id]
		if !ok || len(work.AuthorName) == 0 {
			log.Printf("skipping %s: not found in Open Library", entry.id)
			continue
		}

		var coverURL *string
		if work.CoverID > 0 {
			url := fmt.Sprintf("https://covers.openlibrary.org/b/id/%d-M.jpg", work.CoverID)
			coverURL = &url
		}

		_, err := database.Exec(ctx, `
			INSERT INTO catalog_books (id, title, author, language, cover_url)
			VALUES ($1, $2, $3, $4, $5)
			ON CONFLICT (id) DO UPDATE SET
				title = EXCLUDED.title,
				author = EXCLUDED.author,
				language = EXCLUDED.language,
				cover_url = EXCLUDED.cover_url,
				imported_at = NOW()
		`, entry.id, entry.title, work.AuthorName[0], entry.language, coverURL)
		if err != nil {
			return err
		}
	}

	log.Printf("imported %d of %d catalog books from Open Library", len(works), len(entries))
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
	request, err := http.NewRequestWithContext(ctx, http.MethodGet, openLibrarySearchURL+"?"+query.Encode(), nil)
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
		return nil, fmt.Errorf("search returned %s", response.Status)
	}
	body, err := io.ReadAll(response.Body)
	if err != nil {
		return nil, err
	}
	return parseOpenLibraryWorks(body)
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

func searchCatalogHandler(database *pgxpool.Pool, allowedOrigin string) http.HandlerFunc {
	return func(response http.ResponseWriter, request *http.Request) {
		setCORSHeaders(response, allowedOrigin)

		rows, err := database.Query(request.Context(), `
			SELECT id, title, author, language, cover_url
			FROM catalog_books
			WHERE ($1 = '' OR title ILIKE '%' || $1 || '%' OR author ILIKE '%' || $1 || '%')
				AND ($2 = '' OR language = $2)
			ORDER BY title
			LIMIT 20
		`, strings.TrimSpace(request.URL.Query().Get("q")), request.URL.Query().Get("language"))
		if err != nil {
			log.Printf("could not search catalog: %v", err)
			writeJSONError(response, http.StatusInternalServerError, "could not search catalog")
			return
		}
		defer rows.Close()

		books := []models.Book{}
		for rows.Next() {
			var book models.Book
			if err := rows.Scan(&book.ID, &book.Title, &book.Author, &book.Language, &book.CoverUrl); err != nil {
				log.Printf("could not read catalog book: %v", err)
				writeJSONError(response, http.StatusInternalServerError, "could not search catalog")
				return
			}
			books = append(books, book)
		}

		writeJSON(response, http.StatusOK, books)
	}
}
