# AGENTS Guide

This file explains how coding agents should work in this repository.

## General

### Approach

- Think before acting. Read existing files before writing code.
- Be concise in output but thorough in reasoning.
- Prefer editing over rewriting whole files.
- Do not re-read files you have already read.
- Test your code before declaring done.
- No sycophantic openers or closing fluff.
- Keep solutions simple and direct.
- User instructions always override this file.

### Output

- Return code first. Explanation after, only if non-obvious.
- No inline prose. Use comments sparingly - only where logic is unclear.
- No boilerplate unless explicitly requested.

### Code Rules

- Simplest working solution. No over-engineering.
- No abstractions for single-use operations.
- No speculative features or "you might also want..."
- Read the file before modifying it. Never edit blind.
- No docstrings or type annotations on code not being changed.
- No error handling for scenarios that cannot happen.
- Three similar lines is better than a premature abstraction.

### Review Rules

- State the bug. Show the fix. Stop.
- No suggestions beyond the scope of the review.
- No compliments on the code before or after the review.

### Debugging Rules

- Never speculate about a bug without reading the relevant code first.
- State what you found, where, and the fix. One pass.
- If cause is unclear: say so. Do not guess.

### Simple Formatting

- No em dashes, smart quotes, or decorative Unicode symbols.
- Plain hyphens and straight quotes only.
- Natural language characters (accented letters, CJK, etc.) are fine when the content requires them.
- Code output must be copy-paste safe.

## 1. Project structure

```
packages/
  frontend/   # React, TypeScript, Vite
  backend/    # Go HTTP server
```

- **frontend**: Contains the React application, TypeScript source, and Vite configuration.
- **backend**: Contains the Go HTTP server and its tests.

The frontend is written in **TypeScript** and the backend in **Go**.

---

## 2. Branching and workflow

- **Main branch**: `main` (production-ready)
- **Feature branches**: `feature/<short-description>`
- **Bugfix branches**: `fix/<short-description>`

**Merge strategy**: Pull requests only, reviewed by at least one developer.

---

## 3. Commits

We follow **Conventional Commits**: [https://www.conventionalcommits.org/](https://www.conventionalcommits.org/)

**Format:**

```
<type>(<scope>): <short description>
```

**Types:**

- `feat` – new feature
- `fix` – bug fix
- `docs` – documentation
- `style` – formatting, missing semicolons, etc. (no code changes)
- `refactor` – refactoring without changing functionality
- `test` – adding or fixing tests
- `chore` – build process, dependencies, configs

**Examples:**

```
feat(frontend): add item table component
fix(backend): correct JWT authentication error
docs: update README with setup instructions
```

---

## 4. Code style

**Frontend**

- Language: TypeScript + React
- Build tool: Vite
- Linting: Oxlint
- Folder structure:

```
packages/frontend/
  components/
  hooks/
  pages/
  styles/
  utils/
```

**if-cases without curly braces** are not allowed. Always use curly braces for clarity:

```typescript
// ✅ CORRECT
if (condition) {
  doSomething();
}

// ❌ WRONG
if (condition) doSomething();
```

**Module path imports (Frontend)**

All imports in the frontend must use absolute `src/` paths instead of relative paths:

```typescript
// ✅ CORRECT
import { ListCard } from "src/components/lists/ListCard";
import { useFetchLists } from "src/hooks/useFetchLists";
import type { List } from "src/types/list";

// ❌ WRONG
import { ListCard } from "./ListCard";
import { useFetchLists } from "../../hooks/useFetchLists";
import type { List } from "../types/list";
```

This improves readability, prevents import path issues when moving files, and makes refactoring easier.

**Backend**

- Language: Go
- HTTP package: `net/http`
- Formatting: `gofmt`
- Static checks: `go vet`

All code must pass formatting, tests, and static checks before merging.

---

## 5. Comments and documentation

**Use minimal, essential comments only:**

- Only add comments for **non-obvious logic** or **complex algorithms**
- Never comment self-explanatory code
- Remove inline comments that restate what the code already says
- Keep JSDoc blocks for exported functions (valuable for IDE hints)
- Code should be readable without comments through clear naming and structure

**Examples:**

```typescript
// ✅ CORRECT - JSDoc for exported functions, no obvious inline comments
/**
 * Calculate days between two dates
 */
function getDaysBetween(from: Date, to: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((to.getTime() - from.getTime()) / msPerDay);
}

// ❌ WRONG - Redundant comments
/**
 * Get current date
 * @returns Date object representing today
 */
function getCurrentDate(): Date {
  const now = new Date(); // Create new date
  return now; // Return it
}
```

---

## 7. Development setup

### Backend

```bash
cd packages/backend
go run .
```

### Frontend

```bash
cd packages/frontend
npm ci
npm run dev
```

### Docker

The backend is packaged as a Docker image. It does not use MongoDB or another external database yet.

```bash
docker build -t atelier-backend:local packages/backend
docker run --rm -p 8080:8080 atelier-backend:local
```

The container listens on port `8080` and exposes `GET /health`.

---

## 8. Testing

- Go tests use the standard `testing` package.
- Run all checks before merge:

```bash
cd packages/backend
gofmt -d .
go test ./...
go vet ./...

cd ../frontend
npm ci
npm run lint
npm run build
```

---

## 9. Code review guidelines

- Pull request titles follow conventional commits
- Each PR should describe:
  - What is done
  - Why it is done

- Code must be linted and pass all tests
- Prefer small PRs for easier review

---

## 10. Contributions

- Open issues or tickets first
- Assign yourself to a ticket before work
- Reference tickets in commit messages (`feat(frontend): add item table component #10`)

---

## 11. Deployment

- Build and publish Docker images through the CI pipeline after checks pass.
- Do not deploy through Vercel; deployment uses Docker.
- Use environment variables for sensitive data
- Avoid committing secrets

---

## 12. Dependency versioning

- All dependencies in **every `package.json` file** must use **exact versions** (no `^`, `~`, or other range specifiers).
- Use npm and commit `package-lock.json`; CI must use `npm ci`.
- Example: `"react": "18.2.0"` instead of `"react": "^18.2.0"`.
- This ensures reproducible builds across all environments
- Only example: `@types/node` – this has to stay at `~25`

---

## 13. Additional notes

- All dates in items must be handled in UTC+1
- Status highlights (yellow/red) are derived from the date logic in frontend
- Use Tailwind or equivalent utility classes for styling (optional, can vary per frontend setup)

---

_This AGENTS.md is the canonical source for coding and workflow standards for the Atelier project._
