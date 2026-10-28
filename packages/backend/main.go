package main

import (
	"context"
	"embed"
	"encoding/json"
	"errors"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
)

//go:embed migrations/*.sql
var migrationFiles embed.FS

type createBookRequest struct {
	Title  string `json:"title"`
	Author string `json:"author"`
	Status string `json:"status"`
}

type bookResponse struct {
	ID        string    `json:"id"`
	Title     string    `json:"title"`
	Author    string    `json:"author"`
	Status    string    `json:"status"`
	DateAdded time.Time `json:"dateAdded"`
}

type errorResponse struct {
	Error string `json:"error"`
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		databaseURL = "postgres://postgres:your-password@localhost:5432/atelier_db"
	}

	corsAllowedOrigin := os.Getenv("CORS_ALLOWED_ORIGIN")
	if corsAllowedOrigin == "" {
		corsAllowedOrigin = "http://localhost:5173"
	}

	database, err := pgxpool.New(context.Background(), databaseURL)
	if err != nil {
		log.Fatal(err)
	}
	defer database.Close()

	if err := database.Ping(context.Background()); err != nil {
		log.Fatal(err)
	}

	if err := runMigrations(context.Background(), database); err != nil {
		log.Fatal(err)
	}

	http.HandleFunc("GET /health", healthHandler)
	http.HandleFunc("OPTIONS /books", optionsBooksHandler(corsAllowedOrigin))
	http.HandleFunc("POST /books", createBookHandler(database, corsAllowedOrigin))

	server := &http.Server{Addr: ":" + port}

	go func() {
		log.Printf("Atelier backend listening on http://localhost:%s", port)
		if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatal(err)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)
	<-stop

	log.Println("shutting down")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := server.Shutdown(ctx); err != nil {
		log.Printf("graceful shutdown failed: %v", err)
	}
}

func runMigrations(ctx context.Context, database *pgxpool.Pool) error {
	entries, err := migrationFiles.ReadDir("migrations")
	if err != nil {
		return err
	}

	for _, entry := range entries {
		sql, err := migrationFiles.ReadFile("migrations/" + entry.Name())
		if err != nil {
			return err
		}
		if _, err := database.Exec(ctx, string(sql)); err != nil {
			return err
		}
		log.Printf("applied migration %s", entry.Name())
	}

	return nil
}

func setCORSHeaders(response http.ResponseWriter, allowedOrigin string) {
	response.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
	response.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	response.Header().Set("Access-Control-Allow-Headers", "Content-Type")
}

func optionsBooksHandler(allowedOrigin string) http.HandlerFunc {
	return func(response http.ResponseWriter, request *http.Request) {
		setCORSHeaders(response, allowedOrigin)
		response.WriteHeader(http.StatusNoContent)
	}
}

func writeJSONError(response http.ResponseWriter, status int, message string) {
	response.Header().Set("Content-Type", "application/json")
	response.WriteHeader(status)
	_ = json.NewEncoder(response).Encode(errorResponse{Error: message})
}

func createBookHandler(database *pgxpool.Pool, allowedOrigin string) http.HandlerFunc {
	return func(response http.ResponseWriter, request *http.Request) {
		setCORSHeaders(response, allowedOrigin)

		var input createBookRequest
		if err := json.NewDecoder(request.Body).Decode(&input); err != nil || input.Title == "" || input.Author == "" {
			writeJSONError(response, http.StatusBadRequest, "title and author are required")
			return
		}

		status := input.Status
		if status == "" {
			status = "will-read"
		}

		book := bookResponse{
			ID:     uuid.NewString(),
			Title:  input.Title,
			Author: input.Author,
			Status: status,
		}

		err := database.QueryRow(request.Context(), `
			INSERT INTO books (id, title, author, status)
			VALUES ($1, $2, $3, $4)
			RETURNING date_added
		`, book.ID, book.Title, book.Author, book.Status).Scan(&book.DateAdded)
		if err != nil {
			log.Printf("could not save book: %v", err)
			writeJSONError(response, http.StatusInternalServerError, "could not save book")
			return
		}

		response.Header().Set("Content-Type", "application/json")
		response.WriteHeader(http.StatusCreated)
		_ = json.NewEncoder(response).Encode(book)
	}
}

func healthHandler(response http.ResponseWriter, _ *http.Request) {
	response.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(response).Encode(map[string]string{"status": "ok"})
}
