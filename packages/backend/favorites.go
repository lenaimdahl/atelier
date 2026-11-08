package main

import (
	"context"
	"encoding/json"
	"errors"
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

const maxTrackedClients = 10000

func (limiter *rateLimiter) allow(client string, now time.Time) bool {
	limiter.mu.Lock()
	defer limiter.mu.Unlock()

	window, ok := limiter.clients[client]
	if ok && now.Sub(window.start) < limiter.window {
		if window.count >= limiter.limit {
			return false
		}
		window.count++
		return true
	}

	if !ok && len(limiter.clients) >= maxTrackedClients {
		for key, existing := range limiter.clients {
			if now.Sub(existing.start) >= limiter.window {
				delete(limiter.clients, key)
			}
		}
		if len(limiter.clients) >= maxTrackedClients {
			return false
		}
	}

	limiter.clients[client] = &clientWindow{start: now, count: 1}
	return true
}

// X-Forwarded-For can be set by anyone, so only its last entry and only behind a trusted
// proxy is used. IPv6 is grouped by /64 because one host usually controls a whole /64.
func clientKey(request *http.Request, trustProxy bool) string {
	address := ""
	if trustProxy {
		if forwarded := request.Header.Get("X-Forwarded-For"); forwarded != "" {
			entries := strings.Split(forwarded, ",")
			address = strings.TrimSpace(entries[len(entries)-1])
		}
	}
	if address == "" {
		host, _, err := net.SplitHostPort(request.RemoteAddr)
		if err != nil {
			host = request.RemoteAddr
		}
		address = host
	}

	ip := net.ParseIP(address)
	if ip == nil {
		return address
	}
	if ip.To4() != nil {
		return ip.String()
	}
	return ip.Mask(net.CIDRMask(64, 128)).String() + "/64"
}

func queryFavorites(ctx context.Context, database *pgxpool.Pool) ([]models.FavoriteBook, error) {
	rows, err := database.Query(ctx, `
		SELECT id, title, author, language, favorite_count, last_favorited_at
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
		if err := rows.Scan(&book.ID, &book.Title, &book.Author, &book.Language, &favorite.Count, &favorite.LastAddedAt); err != nil {
			return nil, err
		}
		book.CoverUrl = coverPath(book.ID)
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

func addFavoriteHandler(database *pgxpool.Pool, allowedOrigin string, limiter *rateLimiter, trustProxy bool) http.HandlerFunc {
	return func(response http.ResponseWriter, request *http.Request) {
		setCORSHeaders(response, allowedOrigin)

		// Requiring JSON forces a CORS preflight, so other websites cannot submit picks
		// through a visitor's browser with a simple text/plain request.
		mediaType, _, err := mime.ParseMediaType(request.Header.Get("Content-Type"))
		if err != nil || mediaType != "application/json" {
			writeJSONError(response, http.StatusUnsupportedMediaType, "content type must be application/json")
			return
		}

		if !limiter.allow(clientKey(request, trustProxy), time.Now()) {
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
			RETURNING id, title, author, language, favorite_count, last_favorited_at
		`, input.BookID).Scan(&book.ID, &book.Title, &book.Author, &book.Language, &favorite.Count, &favorite.LastAddedAt)
		if errors.Is(err, pgx.ErrNoRows) {
			writeJSONError(response, http.StatusBadRequest, "book is not in the library")
			return
		}
		if err != nil {
			log.Printf("could not save favorite: %v", err)
			writeJSONError(response, http.StatusInternalServerError, "could not save favorite")
			return
		}

		book.CoverUrl = coverPath(book.ID)
		writeJSON(response, http.StatusCreated, favorite)
	}
}
