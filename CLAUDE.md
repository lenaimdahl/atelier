# CLAUDE.md

How coding agents work in this repository. User instructions always override this file.

## General

### Approach

- Think before acting. Read existing files before writing code.
- Be concise in output but thorough in reasoning.
- Prefer editing over rewriting whole files.
- Do not re-read files you have already read.
- Test your code before declaring done.
- No sycophantic openers or closing fluff.
- Keep solutions simple and direct.
- Never commit or push. Leave changes in the working tree for review.

### Output

- Return code first. Explanation after, only if non-obvious.
- No boilerplate unless explicitly requested.

### Code Rules

- Simplest working solution. No over-engineering.
- No abstractions for single-use operations.
- No speculative features or "you might also want..."
- No error handling for scenarios that cannot happen.
- Three similar lines is better than a premature abstraction.

### Comments

- Only write a comment when it is absolutely needed: a non-obvious trap someone would otherwise break, such as a security decision or a config gotcha.
- No comments that restate the code, no JSDoc for its own sake, no section labels.

### Review Rules

- State the bug. Show the fix. Stop.
- No suggestions beyond the scope of the review.
- No compliments on the code before or after the review.

### Debugging Rules

- Never speculate about a bug without reading the relevant code first.
- State what you found, where, and the fix. One pass.
- If cause is unclear: say so. Do not guess.

### Formatting

- No em dashes, smart quotes, or decorative Unicode symbols.
- Plain hyphens and straight quotes only.
- Natural language characters (accented letters, CJK, etc.) are fine when the content requires them.
- Code output must be copy-paste safe.

## Project structure

```
api/                 # OpenAPI contract and JSON Schema models (source of generated types)
packages/
  frontend/          # React, TypeScript, Vite; served by nginx in production
  bookshelf/         # @atelier/bookshelf: shelf, book search and dialog components
  backend/           # Go HTTP server, PostgreSQL, migrations, embedded book catalog
```

Frontend `src/`: `api/`, `components/`, `hooks/`, `i18n/`, `pages/`, `routes/`, `types/`, `assets/`.

Generated files, never edit by hand:

- `packages/frontend/src/types/generated/` - `pnpm --filter atelier generate:types`
- `packages/frontend/src/api/generated/` - `pnpm --filter atelier generate:api-client`
- `packages/backend/models/generated.go` - `go generate ./...` in `packages/backend`

CI fails if they are out of date.

## Branches and commits

- `main` is production; pushing to it deploys through Coolify.
- Branches: `feat/<short-description>`, `fix/<short-description>`.
- Pull requests only.
- Conventional Commits: `<type>(<scope>): <short description>`, types `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.

## Code style

### Frontend

- TypeScript in strict mode, React, Vite, Oxlint, Vitest.
- Always use curly braces for `if` bodies.
- Import with absolute `src/` paths, never relative paths:

```typescript
import { useFavorites } from "src/hooks/useFavorites";
```

- All UI text goes through i18n (`src/i18n/locales/en.json` and `de.json`).

### Backend

- Go, `net/http` standard library, `pgx` for PostgreSQL.
- `gofmt`, `go vet`, `go mod tidy` must be clean.
- Migrations in `packages/backend/migrations/` run on every start without tracking, so they must be idempotent and never delete data.

## Checks before a PR

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm test
pnpm build

cd packages/backend
gofmt -l .
go mod tidy -diff
go vet ./...
go test ./...
```

## Dependencies

- pnpm only. Versions are pinned exactly in the `catalog` of `pnpm-workspace.yaml`; packages reference them with `catalog:`.
- Commit `pnpm-lock.yaml`; CI uses `pnpm install --frozen-lockfile`.
- GitHub Actions are pinned to commit SHAs with the version as a comment.

## Security

- Secrets only via environment variables, never in the repo.
- The backend requires `DATABASE_URL`. `TRUST_PROXY=true` only behind a proxy that sets `X-Forwarded-For`.
- The frontend loads nothing from third parties. Keep it that way, the Content-Security-Policy in `packages/frontend/nginx.conf.template` depends on it.
