# Atelier

Atelier is a reading tracker for books, labels, personal notes, and a future reading journal.

The project is a pnpm workspace with a React frontend, a Go backend, and reusable feature packages. `@atelier/bookshelf` owns the book list and create-book UI; the frontend owns API access and the portfolio shell.

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
GET /health
POST /books
OPTIONS /books
```

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

PostgreSQL and the Go backend run together through Docker Compose.

Start both services from the repository root:

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
Database: marginalia_db
```

These are local development credentials only.

Create the `books` table from the repository root:

```bash
./scripts/migrate.sh
```

The script can be run repeatedly. It does not delete existing books.

Inspect the database directly:

```bash
docker exec -it marginalia-postgres psql -U postgres -d marginalia_db
```

Useful PostgreSQL commands:

```sql
\dt
\d books
SELECT * FROM books;
\q
```

Stop the services with `Ctrl+C` when `docker compose up` is running, or use:

```bash
docker compose down
```

The database data is kept in the `marginalia_pgdata` Docker volume. To delete the data too:

```bash
docker compose down -v
```

## Data model and generated files

`Book`, `Label`, and `Status` are defined as JSON Schema in `api/models/*.yaml`.

After changing a schema, regenerate the frontend types:

```bash
cd packages/frontend
npm run generate:types
```

Regenerate the backend model types with:

```bash
cd packages/backend
go generate ./...
```

The API contract is defined in `api/openapi.yaml`. After changing it, regenerate the typed frontend API client:

```bash
cd packages/frontend
npm run generate:api-client
```

Current book statuses are:

```text
will-read
reading
finished
quit
```

Generated and local-only files such as `node_modules/` and `dist/` must not be committed.

## Complete development workflow

Use separate terminals:

```text
Terminal 1: docker compose up --build
Terminal 2: ./scripts/migrate.sh
Terminal 3: cd packages/frontend && npm run dev
```

The frontend runs at `http://localhost:5173` and the backend at `http://localhost:8080`.

## Planned features

- Get, update, and delete books through the Go API
- Labels and filtering
- Persistent notes per book
- Reading journal
- Search and reading statistics
- GitHub Actions CI for frontend and backend checks
