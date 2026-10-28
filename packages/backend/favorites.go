package main

import (
	"context"
	"encoding/json"
	"log"
	"mime"
	"net"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/lenaimdahl/atelier/backend/models"
)

const maxFavoriteBodyBytes = 1 << 10

type addFavoriteRequest struct {
	BookID string `json:"bookId"`
}

// rateLimiter allows a fixed number of requests per client within a time window.
type rateLimiter struct {
	mu      sync.Mutex
	limit   int
	window  time.Duration
	clients map[string]*clientWindow
}

type clientWindow struct {
	start time.Time
	count int
}

func newRateLimiter(limit int, window time.Duration) *rateLimiter {
	return &rateLimiter{limit: limit, window: window, clients: map[string]*clientWindow{}}
}

func (limiter *rateLimiter) allow(client string, now time.Time) bool {
	limiter.mu.Lock()
	defer limiter.mu.Unlock()

	// Bounds memory: forget all clients once too many distinct ones were seen.
	if len(limiter.clients) > 10000 {
		limiter.clients = map[string]*clientWindow{}
	}

	window, ok := limiter.clients[client]
	if !ok || now.Sub(window.start) >= limiter.window {
		limiter.clients[client] = &clientWindow{start: now, count: 1}
		return true
	}
	if window.count >= limiter.limit {
		return false
	}
	window.count++
	return true
}

// clientIP uses the last X-Forwarded-For entry, which the reverse proxy in front of the
// backend appends. Entries before it are set by the client and cannot be trusted.
func clientIP(request *http.Request) string {
	if forwarded := request.Header.Get("X-Forwarded-For"); forwarded != "" {
		entries := strings.Split(forwarded, ",")
		return strings.TrimSpace(entries[len(entries)-1])
	}
	host, _, err := net.SplitHostPort(request.RemoteAddr)
	if err != nil {
		return request.RemoteAddr
	}
	return host
}

// queryFavorites returns the shelf, most recently picked first.
func queryFavorites(ctx context.Context, database *pgxpool.Pool) ([]models.FavoriteBook, error) {
	rows, err := database.Query(ctx, `
		SELECT id, title, author, language, cover_url, favorite_count, last_favorited_at
		FROM catalog_books
		WHERE favorite_count > 0
		ORDER BY last_favorited_at DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	favorites := []models.FavoriteBook{}
	for rows.Next() {
		var favorite models.FavoriteBook
		book := &favorite.Book
		if err := rows.Scan(&book.ID, &book.Title, &book.Author, &book.Language, &book.CoverUrl, &favorite.Count, &favorite.LastAddedAt); err != nil {
			return nil, err
		}
		favorites = append(favorites, favorite)
	}
	return favorites, rows.Err()
}

func listFavoritesHandler(database *pgxpool.Pool, allowedOrigin string) http.HandlerFunc {
	return func(response http.ResponseWriter, request *http.Request) {
		setCORSHeaders(response, allowedOrigin)

		favorites, err := queryFavorites(request.Context(), database)
		if err != nil {
			log.Printf("could not list favorites: %v", err)
			writeJSONError(response, http.StatusInternalServerError, "could not list favorites")
			return
		}

		writeJSON(response, http.StatusOK, favorites)
	}
}

func addFavoriteHandler(database *pgxpool.Pool, allowedOrigin string, limiter *rateLimiter) http.HandlerFunc {
	return func(response http.ResponseWriter, request *http.Request) {
		setCORSHeaders(response, allowedOrigin)

		// Requiring JSON forces a CORS preflight, so other websites cannot submit picks
		// through a visitor's browser with a simple text/plain request.
		mediaType, _, err := mime.ParseMediaType(request.Header.Get("Content-Type"))
		if err != nil || mediaType != "application/json" {
			writeJSONError(response, http.StatusUnsupportedMediaType, "content type must be application/json")
			return
		}

		if !limiter.allow(clientIP(request), time.Now()) {
			writeJSONError(response, http.StatusTooManyRequests, "too many picks, please try again later")
			return
		}

		request.Body = http.MaxBytesReader(response, request.Body, maxFavoriteBodyBytes)
		var input addFavoriteRequest
		if err := json.NewDecoder(request.Body).Decode(&input); err != nil || input.BookID == "" {
			writeJSONError(response, http.StatusBadRequest, "bookId is required")
			return
		}

		var favorite models.FavoriteBook
		book := &favorite.Book
		err = database.QueryRow(request.Context(), `
			UPDATE catalog_books
			SET favorite_count = favorite_count + 1, last_favorited_at = NOW()
			WHERE id = $1
			RETURNING id, title, author, language, cover_url, favorite_count, last_favorited_at
		`, input.BookID).Scan(&book.ID, &book.Title, &book.Author, &book.Language, &book.CoverUrl, &favorite.Count, &favorite.LastAddedAt)
		if err == pgx.ErrNoRows {
			writeJSONError(response, http.StatusBadRequest, "book is not in the library")
			return
		}
		if err != nil {
			log.Printf("could not save favorite: %v", err)
			writeJSONError(response, http.StatusInternalServerError, "could not save favorite")
			return
		}

		writeJSON(response, http.StatusCreated, favorite)
	}
}
