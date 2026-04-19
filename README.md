# ScanShield

PII document scanner: upload plain text (JSON or **multipart file**), queue a **BullMQ** job, run regex detection (email, US phone, SSN, credit card), store **findings** (value, type, character offset) and **risk level**, track status end-to-end (`queued` → `processing` → **`completed`** or `failed`).

## Stack

- **Backend:** NestJS, TypeORM, PostgreSQL, Redis, BullMQ, Bull Board (`/admin/queues`)
- **Frontend:** React (Vite)

## Quick start (Docker)

```bash
docker compose up
```

- **API:** http://localhost:3000  
- **UI:** http://localhost:5173 (proxies `/api`, `/auth`, `/admin` to the backend — **`/api/v1/scans`** is served under `/api/...`)  
- **Bull Board:** http://localhost:5173/admin/queues (or http://localhost:3000/admin/queues)

Create an account under **Register**, then use **Documents** and **API keys**. The UI uses a **JWT** after login; **API keys** (`sk_…`) are for automation without the browser.

Optional: protect Bull Board with HTTP Basic by setting **`BULL_BOARD_USER`** and **`BULL_BOARD_PASSWORD`** in the backend environment. If unset, `/admin/queues` stays open (dev convenience).

### Database migrations

Schema is applied with **TypeORM migrations** on backend startup (`migrationsRun: true`; `synchronize` is off). If you previously used an older dev database, reset once:

```bash
docker compose down -v && docker compose up
```

### Seed user + sample documents

With the stack running:

```bash
pnpm seed
```

This **registers** the dev user (or **logs in** if the email already exists), mints an API key, and uploads everything under `apps/frontend/seed-data/`.

Environment (optional): `DEV_SEED_EMAIL`, `DEV_SEED_PASSWORD`, `SCANSHIELD_API_URL`.

## Local (no Docker)

Run PostgreSQL and Redis, set `DATABASE_URL` (or `DATABASE_*`) and `REDIS_HOST` / `REDIS_PORT`, then:

```bash
pnpm install
pnpm dev:backend
pnpm dev:frontend
```

Backend migrations run automatically on start. To run migrations manually: `pnpm --filter backend migration:run`.

## API (matches take-home spec)

Auth:

- `POST /auth/register` — `{ "email", "password" }` → `{ accessToken }`
- `POST /auth/login` — `{ "email", "password" }` → `{ accessToken }`
- `POST /auth/api-keys` — **Bearer JWT** — create API key (shown once)
- `GET /auth/api-keys` / `DELETE /auth/api-keys/:id` — manage keys (JWT)

Scans — **Bearer JWT** or **Bearer API key** (`sk_…`):

**Create document + enqueue scan (JSON):**

```http
POST /api/v1/scans
Authorization: Bearer {api_key}
Content-Type: application/json

{
  "document_name": "employee_records.txt",
  "content": "...the document text..."
}
```

Response includes `documentId`, `id`, and current `status` (e.g. `queued`).

**Get status and findings:**

```http
GET /api/v1/scans/:documentId
Authorization: Bearer {api_key}
```

When `status` is `completed`, the response includes `findings` (each with `type`, `value`, `position` = character offset in the original text).

**Also supported:**

- `GET /api/v1/scans` — list documents for the authenticated user  
- `POST /api/v1/scans` with `multipart/form-data`: field `file` (UTF-8 text) and optional `document_name` / `name`

## What we’d improve with more time

- Refresh-token flow, API key rotation metadata, structured logging, e2e tests  
- Stricter file-type hints on multipart upload; optional line-number reporting for findings  

If we’d hit a 2-hour limit mid-feature, we’d ship a working backend + queue first and stub or simplify the UI, and list the remaining UI work here.
