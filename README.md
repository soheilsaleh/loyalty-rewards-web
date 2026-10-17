# Loyalty & Rewards — Web

A React single-page app for the [**Loyalty & Rewards API**](https://github.com/soheilsaleh/loyalty-rewards-api):
sign in, see your points balance and tier, browse the reward catalog, redeem a
reward with a safe idempotent flow, and page through your full points history.

This is a real, separate consumer of the API — it talks to it only over HTTP
with a bearer token, exactly like a third-party client would.

[![CI](https://github.com/soheilsaleh/loyalty-rewards-web/actions/workflows/ci.yml/badge.svg)](https://github.com/soheilsaleh/loyalty-rewards-web/actions/workflows/ci.yml)

## Demonstrates

- **Auth** — Sanctum token login, session restore on reload, global 401 handling.
- **Idempotent redemption** — a stable `Idempotency-Key` per user intent so a
  retry after a network blip or a `5xx` never spends points twice.
- **Cursor pagination** — history loads page-by-page with `next_cursor`.
- **Honest UI states** — loading skeletons, empty states, and error states with
  a retry for every async view.
- **Typed API layer** — every response is typed; validation errors (`422`) are
  surfaced per field.

## Tech stack

React 19 · TypeScript · Vite · React Router · TanStack Query · Tailwind CSS.
Tests with Vitest + Testing Library + MSW, and one Playwright end-to-end journey.
Linted with ESLint, formatted with Prettier, built in Docker (nginx).

## Quick start

Prerequisites: Node 22+, and the [API](https://github.com/soheilsaleh/loyalty-rewards-api)
running and seeded.

```bash
# 1. In the API repo — start the stack and seed demo data
make up            # or: docker compose up -d
make migrate       # or: docker compose exec app php artisan migrate --seed

# 2. Here — install and run the SPA
npm install
cp .env.example .env
npm run dev        # http://localhost:5173
```

Sign in with the seeded demo account:

| Email                   | Password   |
| ----------------------- | ---------- |
| `customer@loyalty.test` | `password` |

## Configuration

| Variable       | Default                 | Description                                      |
| -------------- | ----------------------- | ------------------------------------------------ |
| `VITE_API_URL` | `http://localhost:8000` | Base URL of the API. Empty string = same origin. |

When the app is served by nginx (Docker), `VITE_API_URL` is empty and `/api/*`
is proxied to the API on the host, so there is no cross-origin request at all.

## Pages

| Route      | What it does                                                         |
| ---------- | -------------------------------------------------------------------- |
| `/login`   | Email/password sign-in with inline validation and rate-limit notice. |
| `/`        | Points balance, tier progress, and the 10 most recent transactions.  |
| `/rewards` | Reward catalog; redeem via a confirmation dialog.                    |
| `/history` | Full ledger with cursor pagination and client-side type filters.     |

## API contract

The app consumes these endpoints of the Loyalty & Rewards API (all under
`/api/v1`, bearer token in `Authorization`):

```
POST   /auth/login              → { data: User, token }
GET    /auth/me                 → { data: User }
POST   /auth/logout             → 204
GET    /me/account              → { data: Account }   (balance, tier)
GET    /me/transactions         → cursor page of PointTransaction
GET    /rewards                 → cursor page of Reward
POST   /rewards/{reward}/redeem → { data: Redemption }   (Idempotency-Key header)
```

The full, maintained contract lives in the API repo's
[`docs/openapi.yaml`](https://github.com/soheilsaleh/loyalty-rewards-api/blob/main/docs/openapi.yaml).

## Design decisions

- **A separate SPA, not Inertia.** The API is the product; this client is just
  one consumer. Keeping it in its own repo over HTTP proves the API is
  complete and usable on its own, and mirrors how a mobile app or third party
  would integrate. The cost is duplicated validation and a CORS layer — see
  the trade-offs below.
- **Token in `sessionStorage`.** Simple, survives reloads within the tab, and
  clears when the tab closes. It is readable by JavaScript and therefore
  exposed to XSS; the cookie-based Sanctum SPA flow (httpOnly cookie + CSRF)
  is the documented hardening path. All storage access is wrapped so a blocked
  storage never breaks the app.
- **Idempotency-Key = user intent.** The key is created on the first redeem
  attempt and **reused on retries**, then discarded once the intent resolves
  (success, or a client-side `4xx` such as insufficient points). This makes
  retries safe without ever blocking a genuinely new redemption.
- **Server owns the truth, client renders states.** Balance and history are
  re-fetched after a redemption (query invalidation) rather than optimistically
  guessed, so the UI can never disagree with the ledger.
- **Type filters are client-side.** The API paginates the ledger as one stream;
  splitting it by type in the client keeps the API surface small and is honest
  about it in the UI ("filters apply to the entries loaded so far").
- **Tier thresholds are a small client-side mirror.** The API exposes a member's
  tier but not a public `/tiers` list yet, so the thresholds live in one
  documented place (`src/features/dashboard/tiers.ts`) and would be replaced by
  a fetch when that endpoint lands.

## Testing

```bash
npm run test          # Vitest in watch mode
npm run test:run      # single run
npm run test:coverage # with coverage

npm run e2e           # Playwright (needs the API running + seeded)
```

Unit and component tests mock the network with MSW and cover the login error
paths, the dashboard loading/error/empty states, the redeem dialog, and — most
importantly — the idempotency-key behaviour on retries.

## Run with Docker

Runs the built SPA behind nginx, proxying `/api` to the API on the host:

```bash
docker compose up --build   # open http://localhost:8080
```

## Project structure

```
src/
  api/        typed fetch client, error type, query keys, API types
  auth/       token store, AuthProvider, ProtectedRoute, useAuth
  components/ shared UI (Button, Card, states, layout, list)
  features/   auth, dashboard, rewards, history (pages + hooks)
  lib/        formatting, uuid, query client
  test/       MSW server, handlers, render helper
e2e/          Playwright journey
```

## Known limitations

- The API has no `/tiers` endpoint, so thresholds are mirrored in the client.
- History type-filtering only applies to pages already loaded.
- No dark-mode toggle yet (styles support it; it follows the OS preference).
- No request de-duplication beyond TanStack Query's cache.

## License

[MIT](./LICENSE) © 2026 Soheil Saleh
