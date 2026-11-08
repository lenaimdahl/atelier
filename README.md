# Atelier

Atelier is my little workshop on the web. Small projects, built properly, and everything is open to look at.

Right now there are two things to play with:

- **Bookshelf**: a shared shelf where you can pick your favorite book from my library of 100 feminist books.
- **Citizen Lab**: build your own 40C3 "model citizen" and share it as a link (more below).

Under the hood it's a pnpm workspace with a React frontend, a Go backend and reusable feature packages. `@atelier/bookshelf` takes care of the shelf, the book search and the dialog; the frontend handles API access and the portfolio shell around it.

The homepage and the Citizen Lab got a dark terminal look based on the [40C3 styleguide](https://events.ccc.de/congress/2026/infos/styleguide/). The Bookshelf keeps its own blue/red style on purpose. All pages share the same header, only the colors change per area (the `--frame-*` CSS variables in `packages/frontend/src/index.css`).

## What you need

- Node.js and pnpm
- Go (version in `packages/backend/go.mod`)
- Docker Desktop

## Frontend

Install everything and start the Vite dev server from the repo root:

```bash
pnpm install
pnpm dev
```

Then open `http://localhost:5173`.

Before pushing, I run:

```bash
pnpm build
pnpm lint
pnpm test
```

`pnpm test` runs the Vitest tests for the Citizen Lab (layout, share links, rendering).

## Backend API

Run the backend locally without Docker (with the database from Docker Compose running):

```bash
cd packages/backend
DATABASE_URL=postgres://postgres:your-password@localhost:5432/atelier_db go run .
```

Configuration:

| Variable              | Default                 | Meaning                                                                                                                                      |
| --------------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`        | none, required          | PostgreSQL connection string                                                                                                                 |
| `PORT`                | `8080`                  | HTTP port                                                                                                                                    |
| `CORS_ALLOWED_ORIGIN` | `http://localhost:5173` | Origin of the frontend                                                                                                                       |
| `TRUST_PROXY`         | off                     | Set to `true` only behind a reverse proxy that appends the client IP to `X-Forwarded-For` (Coolify does). Otherwise anyone could fake their IP. |

It listens on `http://localhost:8080`.

Backend checks:

```bash
cd packages/backend
go test ./...
go vet ./...
gofmt -d .
```

## Database and Docker

PostgreSQL, the Go backend and the frontend (served by nginx) all run together with Docker Compose.

Start everything from the repo root:

```bash
docker compose up --build
```

You only need `--build` after changing Go code, the Dockerfile, `go.mod` or `go.sum`. Otherwise `docker compose up` is enough.

All ports are bound to `127.0.0.1`, so nothing is reachable from the network you are on (handy at Congress).

Where to find things:

```text
PostgreSQL: localhost:5432
Backend:    http://localhost:8080
```

Local database login:

```text
User:     postgres
Password: your-password
Database: atelier_db
```

On every start the backend applies all SQL files in `packages/backend/migrations/` in name order. It doesn't keep track of what already ran, so every migration has to be safe to run again (for example `CREATE TABLE IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`) and must never delete existing data.

Peek into the database:

```bash
docker exec -it atelier-postgres psql -U postgres -d atelier_db
```

Stop everything with `Ctrl+C` while `docker compose up` is running, or:

```bash
docker compose down
```

The data lives in the `atelier_pgdata` Docker volume. To wipe it too:

```bash
docker compose down -v
```

## Data model and generated files

`Book` and `FavoriteBook` are defined as JSON Schema in `api/models/*.yaml`.

After changing a schema, regenerate the frontend types:

```bash
pnpm --filter atelier generate:types
```

And the backend model types:

```bash
cd packages/backend
go generate ./...
```

The API contract lives in `api/openapi.yaml`. After changing it, regenerate the typed frontend API client:

```bash
pnpm --filter atelier generate:api-client
```

## Book library

You can pick from a fixed library of 50 English and 50 German feminist books, listed in `packages/backend/catalog/books.txt` by Open Library work ID.

Generated and local-only stuff like `node_modules/` and `dist/` never gets committed.

## Citizen Lab

At `/citizen-lab` you build a citizen from bodies, heads, hair, eyes, noses, mouths and decorations, pick the colors, add a tag and, if you like, the 40C3 logo. Then download it as SVG or PNG.

- **Share links**: the whole citizen is packed into a short code in the URL (`/citizen-lab/1aZ3kP9xQ2`, plus the tag after a dot), so whatever is in the address bar is your share link. Nothing goes to the backend. The code layout is fixed in `citizenShareState.ts`; adding new parts needs a new code version, and a test fails until it gets one.
- **Layout**: all positions are calculated in `packages/frontend/src/components/citizen-lab/citizenLayout.ts`. The geometry of each head, body and eye set and one definition per decoration (layer, recoloring, layout) live there; the portrait component only draws.
- **Assets**: the SVG parts are in `packages/frontend/src/assets/40c3-creator/`. To add a head, eyes or a decoration, drop in the file and add one entry in `citizenLayout.ts`. The tests complain if an option has no layout data.

## Credits

- The citizen graphics in `packages/frontend/src/assets/40c3-creator/` and the 40C3 logos are unmodified files from the [40C3 styleguide](https://events.ccc.de/congress/2026/infos/styleguide/) by [mcgraw](https://mcgraw.club). All rights stay with them. Thank you for sharing them!
- Fonts: Jersey 10 (SIL Open Font License) and Hack (MIT / Bitstream Vera License) in `packages/frontend/public/fonts/`, with their license files. VT323 and IBM Plex Mono (SIL Open Font License) come via Fontsource.

## Security

Found a problem? See [SECURITY.md](SECURITY.md).

## License

Copyright (C) 2026 Lena Imdahl

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License version 3, see [LICENSE](LICENSE).

Not covered by this license:

- the 40C3 graphics and logos in `packages/frontend/src/assets/40c3-creator/` ([mcgraw](https://mcgraw.club) / 40C3 design team / Chaos Computer Club, CC0 license)
- the fonts in `packages/frontend/public/fonts/`, which come with their own license files
