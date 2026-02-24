# Recruitment Application (IV1201)

Full-stack recruitment application with:

- Client (frontend)
- Server (Node.js / Express REST API)
- PostgreSQL database (local Postgres or Neon.tech)
- Deployments on Render.com (client + server)

## Live deployments

- API (Render): https://recruitment-application-iv1201.onrender.com
- Client (Render): https://recruitment-application-iv1201-client.onrender.com

> Note: Render free instances may sleep after inactivity. First request can take a while.
> Avoid spamming requests while the server wakes up.

---

## Project structure

```text
root/
  client/                # Frontend app
  server/                # Express API + DB scripts + migrations
  docs/server_api.md     # API reference (v1)
````

---

## Tech stack (server)

* Node.js (CI uses Node 20)
* Express 5
* PostgreSQL (`pg`)
* Joi validation
* JWT auth (custom HS256 implementation)
* MailerSend Email API (REST) for password recovery emails

---

## Quick start (local development)

## Prerequisites

Install:

* Node.js 20+
* npm
* PostgreSQL (local)
* psql CLI (required by the DB init/reset scripts)

> The DB scripts use `psql` directly (`db:init`, `db:reset`), so having Postgres installed without the CLI is not enough.

---

## 1) Server setup (local)

### Create env file

Create `server/src/.env` (or copy from a safe template if you add one later).

Example:

```env
# ---- Database (local Postgres) ----
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=recruitment_db
DB_HOST=localhost
DB_PORT=5432

# Optional: if set, server will use this instead of DB_* values
# DATABASE_URL=postgresql://user:password@host:5432/dbname

# ---- Auth ----
JWT_SECRET=change-this-in-production

# ---- CORS ----
CORS_ORIGINS=http://localhost:3001,https://recruitment-application-iv1201-client.onrender.com

# ---- Frontend URL (used in recovery email links) ----
APP_BASE_URL=http://localhost:3001

# ---- Recovery token settings (optional, defaults to 30) ----
RECOVERY_TOKEN_TTL_MINUTES=30

# ---- Email / MailerSend (required for password recovery emails) ----
# Create a MailerSend API key and verify your sending domain first.
MAILERSEND_API_KEY=ms_xxxxxxxxxxxxxxxxxxxxxxxxx

# Optional (defaults shown)
# MAILERSEND_API_URL=https://api.mailersend.com/v1/email
# MAILERSEND_TIMEOUT_MS=10000
# MAILERSEND_VERIFY_TLS=true
# MAILERSEND_REPLY_TO=Support <support@example.com>

# Required sender (must be on a verified MailerSend domain)
MAIL_FROM=Recruitment App <no-reply@registered-domain.com>

# Optional branding
# APP_NAME=Recruitment Application
```

### Create the local database (one-time)

Create the database referenced by `DB_NAME` (default: `recruitment_db`) before running `db:init`.

Examples:

```bash
createdb -U postgres recruitment_db
```

### Install + initialize DB + run server

```bash
cd server
npm install
npm run db:init
npm run dev
```

Server runs on:

* `http://localhost:3000`
* API base: `http://localhost:3000/api/v1`

### Reset local DB (rebuild from migration scripts)

```bash
cd server
npm run db:reset
```

This drops app tables + legacy schema and rebuilds from the migration flow.

---

## 2) Client setup (local)

```bash
cd client
npm install
npm start
```

The client is expected to run on:

* `http://localhost:3001`

> The server CORS default allowlist already includes `http://localhost:3001`.

### Client environment variables

The exact client env variable names depend on the frontend implementation (not documented here yet).
If the client needs an API base URL, configure it to point to:

* Local API: `http://localhost:3000/api/v1`
* Render API: `https://recruitment-application-iv1201.onrender.com/api/v1`

> TODO for maintainers: add `client/.env.example` with the exact variable names used by the frontend.

---

## Environment variables (server) reference

This is the handoff-critical part.

### Required in most setups

* `JWT_SECRET`
  Secret used to sign/verify JWTs. Must be strong in production.

### Database (choose one mode)

#### Option A: Local Postgres (`DB_*`)

* `DB_USER`
* `DB_PASSWORD`
* `DB_NAME`
* `DB_HOST`
* `DB_PORT`

#### Option B: Hosted Postgres (`DATABASE_URL`)

* `DATABASE_URL`

If `DATABASE_URL` is set, the server uses it instead of `DB_*`.

### CORS / frontend link generation

* `CORS_ORIGINS` (comma-separated list)
* `APP_BASE_URL` (used for password recovery links)
* Also supported as alternatives in code: `FRONTEND_URL`, `CLIENT_URL`

### Email / password recovery

Required for recovery emails:

* `MAILERSEND_API_KEY`
* `MAIL_FROM` (must use a verified MailerSend domain)

Optional:

* `MAILERSEND_API_URL` (default `https://api.mailersend.com/v1/email`)
* `MAILERSEND_TIMEOUT_MS` (default `10000`, clamped to `1000..60000`)
* `MAILERSEND_VERIFY_TLS` (default `true`; currently kept for compatibility)
* `MAILERSEND_REPLY_TO`
* `RECOVERY_TOKEN_TTL_MINUTES` (default 30, clamped to `5..180`)
* `APP_NAME` (email subject branding)

---

## Database initialization flows

The server includes two different DB flows:

### Local Postgres (development)

Uses:

* `npm run db:init`
* `npm run db:reset`

This flow:

1. Loads legacy dump into `legacy.*`
2. Creates new schema in `public.*`
3. Copies/migrates legacy data into new schema
4. Syncs imported account roles/password states

### Cloud Postgres / Neon (hosted)

Uses:

* `npm run db:init:cloud`
* `npm run db:reset:cloud`

This flow is adapted for Neon/Postgres hosting and:

* uses `DATABASE_URL`
* enforces SSL
* strips SQL statements Neon won’t accept (ownership/role/grants etc.)

> Important: The cloud scripts also require `psql` installed on the machine where you run them.

---

## Render.com deployment guide (server + client)

This repo appears to deploy both apps on Render, with deploy hooks triggered by GitHub Actions.

### Recommended architecture

* Render Web Service → `server/`
* Render Static Site (or Web Service) → `client/`
* Neon.tech PostgreSQL → production DB

---

## Server on Render (Web Service)

Create a new Web Service from this repo.

### Settings

* Root Directory: `server`
* Build Command: `npm install`
* Start Command: `npm start`
* Runtime: Node
* Node version: 20 (recommended to match CI)

### Required environment variables on Render (server)

Set these in Render → Environment:

```env
NODE_ENV=production
PORT=10000                 # Render provides PORT automatically; optional to set manually
DATABASE_URL=<Neon connection string>
JWT_SECRET=<strong-random-secret>
CORS_ORIGINS=https://recruitment-application-iv1201-client.onrender.com,http://localhost:3001
APP_BASE_URL=https://recruitment-application-iv1201-client.onrender.com

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=<smtp user>
MAIL_PASSWORD=<smtp app password>
MAIL_FROM=Recruitment App <your-email@gmail.com>
```

Optional:

```env
RECOVERY_TOKEN_TTL_MINUTES=30
MAIL_VERIFY=true
APP_NAME=Recruitment Application
```

### Initialize the production DB (Neon) before first use

From the local machine (with `psql` installed), run:

```bash
cd server
# Set DATABASE_URL in the shell first.
# Note: db:init:cloud and db:reset:cloud read process.env directly and do NOT load server/src/.env automatically.
npm install
npm run db:init:cloud
```

If you need a full rebuild/reset:

```bash
npm run db:reset:cloud
```

> Warning: `db:reset:cloud` drops app tables / schemas and rebuilds the database. Do not run this on production unless intended.

---

## Client on Render

Depending on how the frontend is configured, use either:

* Static Site (common for React build output)
* or Web Service (if using a custom server)

### Typical Static Site setup

* Root Directory: `client`
* Build Command: `npm install && npm run build`
* Publish Directory: `build`

### Client env vars (Render)

Set the frontend API base URL to your Render API service (exact variable name depends on client code).

Use:

* `https://recruitment-application-iv1201.onrender.com/api/v1`

> TODO for maintainers: document the exact client env variable names in `client/README.md` or `client/.env.example`.

---

## Neon.tech setup guide (database)

1. Create a project/database in Neon
2. Copy the connection string (`postgresql://...`)
3. Use it as `DATABASE_URL` in:

   * Render server environment variables
   * local terminal when running `db:init:cloud` / `db:reset:cloud`

### Example

```bash
# macOS/Linux
export DATABASE_URL='postgresql://user:pass@host/db?sslmode=require'

# Windows PowerShell
$env:DATABASE_URL='postgresql://user:pass@host/db?sslmode=require'
```

Then run:

```bash
cd server
npm run db:init:cloud
```

> Note: `server/src/.env` is used by the server app and local DB scripts.  
> The cloud DB scripts (`db:init:cloud`, `db:reset:cloud`) require `DATABASE_URL` to be present in the shell environment unless you manually load dotenv before running them.

---

## API documentation

Detailed API docs live at:

* `docs/server_api.md`

Base URLs:

* Local: `http://localhost:3000/api/v1`
* Render: `https://recruitment-application-iv1201.onrender.com/api/v1`

Health check:

* `GET /api/v1/health`

---

## Common developer workflows

### Run server tests

```bash
cd server
npm test
```

### Lint server

```bash
cd server
npm run lint:ci
```

### Run both apps locally (two terminals)

```bash
# Terminal 1
cd server
npm run dev

# Terminal 2
cd client
npm start
```

---

## CI / deployment automation (GitHub Actions)

The repo includes workflows for:

* CI (`.github/workflows/ci.yaml`)

  * client tests/build
  * server lint/tests
* CodeQL
* Render deploy hooks (`.github/workflows/deploy.yml`)

### Required GitHub secrets for deploy workflow

Set these in GitHub repo settings:

* `RENDER_DEPLOY_HOOK` (server deploy hook URL)
* `RENDER_CLIENT_DEPLOY_HOOK` (client deploy hook URL)

---

## Troubleshooting

### `psql` command not found

Install PostgreSQL client tools and ensure `psql` is on your PATH.

### CORS errors in browser

Check `CORS_ORIGINS` on the server. It must include your client URL exactly.

### Password recovery emails not sending

Verify:

* `MAILERSEND_API_KEY` is set and valid
* `MAIL_FROM` uses a MailerSend-verified domain/sender
* `APP_BASE_URL` points to the frontend URL (so links are correct)
* your MailerSend account/domain is allowed to send from the configured sender

### Server boots but `/health` returns degraded

Database connection is failing. Re-check:

* `DATABASE_URL` (Neon) or `DB_*` (local)
* SSL requirement for hosted DBs
* firewall/network access
