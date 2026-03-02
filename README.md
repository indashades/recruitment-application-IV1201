# Recruitment Application (IV1201)

Full-stack recruitment application with:

- a React client in `client/`
- a Node.js / Express REST API in `server/`
- a PostgreSQL database
- support for local PostgreSQL and hosted PostgreSQL via `DATABASE_URL`
- password recovery by email using MailerSend

## Project structure

```text
root/
  client/   # React frontend
  server/   # Express API, database scripts, migrations, tests
```

## Live deployments

- API: `https://recruitment-application-iv1201.onrender.com`
- Client: `https://recruitment-application-iv1201-client.onrender.com`

> Render free instances may sleep after inactivity, so the first request can be slow.

---

# Client

## Overview

The client is a Create React App frontend that uses:

- React
- React Router
- MobX

The app uses **hash routing** (`#/...`), for example:

- `#/`
- `#/Log`
- `#/Reg`
- `#/Appl`
- `#/rec`
- `#/rec1`
- `#/__recover?token=...`

API requests are sent to the backend using:

- `REACT_APP_API_BASE_URL`

If that variable is not set, the client defaults to the deployed Render API:

- `https://recruitment-application-iv1201.onrender.com/api/v1`

## Client prerequisites

Install:

- Node.js 20+
- npm

## Client environment variables

Create `client/.env`.

Example:

```env
PORT=3001
REACT_APP_API_BASE_URL=http://localhost:3000/api/v1
```

### Notes

- `PORT=3001` makes CRA run on `http://localhost:3001`
- `REACT_APP_API_BASE_URL` points the client to the local backend
- if `REACT_APP_API_BASE_URL` is omitted, the client talks to the deployed API on Render

## Run the client locally

```bash
cd client
npm install
npm start
```

The client will run on:

- `http://localhost:3001`

## Build the client

```bash
cd client
npm run build
```

Production files are written to:

- `client/build/`

## Test the client

```bash
cd client
npm test
```

## Client deployment notes

The client is suitable for static hosting.

Because it uses **hash routing**, deep-link rewrite rules are usually not required in the same way as browser-history routing.

A typical static deployment uses:

- Root Directory: `client`
- Build Command: `npm install && npm run build`
- Publish Directory: `build`

For hosted builds, set:

```env
REACT_APP_API_BASE_URL=https://recruitment-application-iv1201.onrender.com/api/v1
```

---

# Server

## Overview

The server is an Express 5 API with:

- PostgreSQL via `pg`
- Joi request validation
- JWT-based authentication
- role-based authorization (`applicant` / `recruiter`)
- MailerSend-based password recovery
- structured event logging stored in the database

Base API path:

- `/api/v1`

## Server prerequisites

Install:

- Node.js 20+
- npm
- PostgreSQL
- `psql` CLI

> The database init/reset scripts call `psql` directly. PostgreSQL must be installed with command-line tools available on your `PATH`.

## Server environment variables

The server loads environment variables from:

- `server/src/.env`

Create that file before running the API locally.

Example:

```env
# ---- Database: local mode ----
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=recruitment_db
DB_HOST=localhost
DB_PORT=5432

# Optional: hosted database mode
# DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require

# ---- Auth ----
JWT_SECRET=change-this-in-production

# ---- CORS ----
CORS_ORIGINS=http://localhost:3001,https://recruitment-application-iv1201-client.onrender.com

# ---- Frontend URL used for recovery links ----
APP_BASE_URL=http://localhost:3001

# ---- Recovery tokens ----
RECOVERY_TOKEN_TTL_MINUTES=30

# ---- MailerSend ----
MAILERSEND_API_KEY=ms_xxxxxxxxxxxxxxxxxxxxxxxxx
MAIL_FROM=Recruitment App <no-reply@your-domain.com>

# Optional MailerSend settings
# MAILERSEND_API_URL=https://api.mailersend.com/v1/email
# MAILERSEND_TIMEOUT_MS=10000
# MAILERSEND_VERIFY_TLS=true
# MAILERSEND_REPLY_TO=Support <support@example.com>

# Optional email branding
# APP_NAME=Recruitment Application
```

## Server environment reference

### Authentication

- `JWT_SECRET`  
  Secret used to sign and verify JWTs.

### Database

Use one of these modes:

#### Local PostgreSQL

- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `DB_HOST`
- `DB_PORT`

#### Hosted PostgreSQL

- `DATABASE_URL`

If `DATABASE_URL` is set, the server uses it instead of `DB_*`.

### CORS and frontend URL

- `CORS_ORIGINS`  
  Comma-separated list of allowed browser origins.
- `APP_BASE_URL`  
  Used when generating password recovery links.
- `FRONTEND_URL` and `CLIENT_URL` are also supported as fallbacks in code.

### Recovery token settings

- `RECOVERY_TOKEN_TTL_MINUTES`  
  Default: `30`  
  Allowed range in code: `5..180`

### MailerSend

Required for password recovery email delivery:

- `MAILERSEND_API_KEY`
- `MAIL_FROM`

Optional:

- `MAILERSEND_API_URL`
- `MAILERSEND_TIMEOUT_MS`
- `MAILERSEND_VERIFY_TLS`
- `MAILERSEND_REPLY_TO`
- `APP_NAME`

## Run the server locally

```bash
cd server
npm install
npm run dev
```

The server runs on:

- `http://localhost:3000`

API base URL:

- `http://localhost:3000/api/v1`

## Local database setup

### 1. Create the database

Create the database referenced by `DB_NAME` before running the init script.

Example:

```bash
createdb -U postgres recruitment_db
```

### 2. Initialize the database

```bash
cd server
npm install
npm run db:init
```

This flow:

1. loads the legacy SQL dump into `legacy.*`
2. creates the new schema in `public.*`
3. copies legacy data into the new schema
4. syncs imported user accounts, roles, password hashes, and password-reset flags

### 3. Reset the local database

```bash
cd server
npm run db:reset
```

This drops app tables and the `legacy` schema, then rebuilds from the migration flow.

> Warning: this is destructive.

## Hosted PostgreSQL / cloud database setup

The server also supports hosted PostgreSQL using `DATABASE_URL`.

### Initialize a cloud database

Set `DATABASE_URL` in your shell, then run:

```bash
cd server
npm install
npm run db:init:cloud
```

### Reset a cloud database

```bash
cd server
npm run db:reset:cloud
```

### Cloud script notes

- `db:init:cloud` and `db:reset:cloud` read `DATABASE_URL` from the shell environment
- those scripts do **not** automatically load `server/src/.env`
- they still require `psql`
- the cloud flow enforces SSL and strips SQL statements that hosted providers like Neon may reject

> Warning: `db:reset:cloud` is destructive.

## API routes

Base path:

- `/api/v1`

### Health

- `GET /health`

Returns:

- `200` with `status: "ok"` when the database is reachable
- `503` with `status: "degraded"` when the API is up but the database is unavailable

### Authentication

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/recovery/request`
- `POST /auth/recovery/confirm`

### Applications

- `POST /applications`  
  Auth required, applicant only
- `GET /applications`  
  Auth required, recruiter only
- `GET /applications/:id`  
  Auth required, recruiter only
- `PATCH /applications/:id/status`  
  Auth required, recruiter only

### Competences

- `GET /competences`

### Logs

- `GET /logs`  
  Auth required, recruiter only

## Authentication model

The API uses Bearer tokens.

Send:

```http
Authorization: Bearer <jwt>
```

Roles enforced in middleware:

- `applicant`
- `recruiter`

## Password recovery flow

The recovery flow works like this:

1. the client calls `POST /api/v1/auth/recovery/request`
2. the server creates a one-time recovery token
3. the server builds a frontend link using `APP_BASE_URL`
4. MailerSend sends the recovery email
5. the user opens the frontend recovery page
6. the client calls `POST /api/v1/auth/recovery/confirm`

The generated recovery URL format is:

```text
<APP_BASE_URL>/#/__recover?token=<token>
```

Example local value:

```text
http://localhost:3001/#/__recover?token=...
```

If `APP_BASE_URL` is wrong or missing, recovery links will point to the wrong frontend.

## Server scripts

From `server/package.json`:

- `npm test` — run Jest tests
- `npm start` — run the API with Node
- `npm run dev` — run the API with nodemon
- `npm run db:init` — initialize local database
- `npm run db:reset` — reset local database
- `npm run db:init:cloud` — initialize cloud database
- `npm run db:reset:cloud` — reset cloud database
- `npm run lint:ci` — run ESLint

## Test the server

```bash
cd server
npm test
```

## Lint the server

```bash
cd server
npm run lint:ci
```

## Deployment notes

### Server

Typical hosted server settings:

- Root Directory: `server`
- Build Command: `npm install`
- Start Command: `npm start`
- Runtime: Node 20

Typical required production environment variables:

```env
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=<strong-secret>
CORS_ORIGINS=https://recruitment-application-iv1201-client.onrender.com,http://localhost:3001
APP_BASE_URL=https://recruitment-application-iv1201-client.onrender.com
MAILERSEND_API_KEY=ms_xxxxxxxxxxxxxxxxxxxxxxxxx
MAIL_FROM=Recruitment App <no-reply@your-domain.com>
```

### Client

Typical hosted client settings:

- Root Directory: `client`
- Build Command: `npm install && npm run build`
- Publish Directory: `build`

Typical production client environment:

```env
REACT_APP_API_BASE_URL=https://recruitment-application-iv1201.onrender.com/api/v1
```

---

# Local development

## Run both apps locally

Use two terminals.

### Terminal 1: server

```bash
cd server
npm install
npm run dev
```

### Terminal 2: client

```bash
cd client
npm install
npm start
```

Expected local URLs:

- client: `http://localhost:3001`
- server: `http://localhost:3000`
- API base: `http://localhost:3000/api/v1`

---

# Troubleshooting

## `psql` command not found

Install PostgreSQL client tools and make sure `psql` is on your `PATH`.

## Browser CORS errors

Check the server `CORS_ORIGINS` value. It must include the exact client origin, for example:

```env
CORS_ORIGINS=http://localhost:3001
```

## Client is calling the deployed API instead of local API

Set this in `client/.env`:

```env
REACT_APP_API_BASE_URL=http://localhost:3000/api/v1
```

Then restart the client dev server.

## Password recovery emails are not sending

Check:

- `MAILERSEND_API_KEY`
- `MAIL_FROM`
- `APP_BASE_URL`
- that your MailerSend sender/domain is verified

## Recovery link opens the wrong frontend URL

Check:

- `APP_BASE_URL` on the server

For local development it should usually be:

```env
APP_BASE_URL=http://localhost:3001
```

## Health endpoint returns degraded

The API is up, but the database connection failed.

Check:

- `DATABASE_URL` or `DB_*`
- database availability
- SSL requirements for hosted databases
- firewall or network access