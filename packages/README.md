# Atelier

Atelier is a portfolio project. Its first feature is a shared shelf where visitors pick their favorite book from a curated library of 100 feminist books.

The project is a pnpm workspace with a React frontend, a Go backend, and reusable feature packages. `@atelier/bookshelf` owns the shelf, the book search and the dialog UI; the frontend owns API access and the portfolio shell.

## Prerequisites

- Node.js and pnpm
- Go version specified in `backend/go.mod`
- Docker Desktop

## Frontend

Install workspace dependencies and start the Vite development server from the repository root:

```bash
pnpm install
pnpm dev
```

The frontend is normally available at `http://localhost:5173`.

Frontend checks:

```bash
pnpm build
pnpm lint
```

## Backend API

The backend provides these endpoints:

```text
GET     /health
GET     /catalog?q=<text>&language=<en|de>
GET     /covers/{id}
GET     /favorites
POST    /favorites
OPTIONS /favorites
```

`POST /favorites` only accepts `application/json`, bodies up to 1 KB and at most 10 picks
per minute per client. The client IP is taken from the last `X-Forwarded-For` entry, so the
backend must run behind a reverse proxy that sets this header (Coolify does).

To run the backend locally without Docker:

```bash
cd packages/backend
go run .
```

The backend listens on `http://localhost:8080` by default. To use another port:

```bash
cd packages/backend
PORT=8081 go run .
```

Run backend checks:

```bash
cd packages/backend
go test ./...
go vet ./...
gofmt -d .
```

## Database and Docker

PostgreSQL, the Go backend and the frontend (served by nginx) run together through Docker Compose.

Start all services from the repository root:

```bash
docker compose up --build
```

Use `--build` after changing Go code, the Dockerfile, `go.mod`, or `go.sum`. If nothing changed, `docker compose up` is sufficient.

The services are available at:

```text
PostgreSQL: localhost:5432
Backend:    http://localhost:8080
```

The local database uses:

```text
User:     postgres
Password: your-password
Database: atelier_db
```

These are local development credentials only.

The backend applies all SQL files in `packages/backend/migrations/` in name order on every
start. Applied migrations are not tracked, so every migration must be idempotent (for
example `CREATE TABLE IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`) and must not delete
existing data.

Inspect the database directly:

```bash
docker exec -it atelier-postgres psql -U postgres -d atelier_db
```

Useful PostgreSQL commands:

```sql
\dt
\d catalog_books
SELECT title, author, language FROM catalog_books;
SELECT * FROM favorites;
\q
```

Stop the services with `Ctrl+C` when `docker compose up` is running, or use:

```bash
docker compose down
```

The database data is kept in the `atelier_pgdata` Docker volume. To delete the data too:

```bash
docker compose down -v
```

## Data model and generated files

`Book` and `FavoriteBook` are defined as JSON Schema in `api/models/*.yaml`.

After changing a schema, regenerate the frontend types:

```bash
pnpm --filter atelier generate:types
```

Regenerate the backend model types with:

```bash
cd packages/backend
go generate ./...
```

The API contract is defined in `api/openapi.yaml`. After changing it, regenerate the typed frontend API client:

```bash
pnpm --filter atelier generate:api-client
```

## Book library

Visitors pick favorites from a fixed library of 50 English and 50 German feminist books,
listed in `packages/backend/catalog/books.txt` by Open Library work ID. On startup the
backend imports author and cover for missing books from the Open Library API in a single
search request, downloads the covers and stores everything in PostgreSQL. Covers are served
by the backend, so visitors' browsers never contact Open Library. Titles and languages are
taken from `books.txt` on every start, and books removed from the file are deleted together
with their picks. If Open Library is unreachable, the import retries with increasing delays.

Visitors can only pick books from this library. Picks are stored as a counter per book.

Generated and local-only files such as `node_modules/` and `dist/` must not be committed.

## Complete development workflow

Use separate terminals. Compose starts only the database and the backend here, because the
Vite dev server needs port 5173, which is also the allowed CORS origin:

```text
Terminal 1: docker compose up --build postgres backend
Terminal 2: pnpm dev
```

The frontend runs at `http://localhost:5173` and the backend at `http://localhost:8080`.

## Planned features

- SVG cutting for sheet metal
