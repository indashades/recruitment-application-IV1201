````md
# API v1

Base URL (local): `http://localhost:3000/api/v1`  
All responses are JSON.

---

## Response formats

### Success

```json
{
  "message": "human readable message",
  "data": {}
}
````

### Error

```json
{
  "error": {
    "code": "STABLE_CODE",
    "message": "human readable message",
    "requestId": "optional-correlation-id",
    "details": {}
  }
}
```

Notes:

* `error.details` is included for non-5xx errors when available.
* For 5xx errors, message is generic (`"Internal Server Error"`).
* Server also sets `x-request-id` response header.

Common error codes:

* `BAD_JSON` (HTTP 400) – invalid JSON body
* `AUTH_REQUIRED` (HTTP 401) – missing token
* `AUTH_INVALID` (HTTP 401) – invalid credentials, malformed auth header, or invalid/expired token
* `FORBIDDEN` (HTTP 403) – wrong role
* `NOT_FOUND` (HTTP 404)
* `CONFLICT` (HTTP 409) – conflict (including optimistic lock conflict)
* `VALIDATION_ERROR` (HTTP 422) – request schema invalid, `error.details.issues` includes field problems
* `DB_ERROR` (HTTP 500) – database-layer error
* `INTERNAL_ERROR` (HTTP 500) – unexpected server error fallback

---

## Authentication

### Register (creates applicant account)

`POST /auth/register`

Body

```json
{
  "username": "username",
  "password": "password",
  "firstName": "FName",//guh you use firstName and lastName not FName and LName
  "lastName": "LName",
  "email": "email@example.com",
  "personnummer": "199001011234"
}
```

Validation rules:

* `username`: string, trimmed, length `3..50`
* `password`: string, length `8..200`
* `firstName`: string, trimmed, length `1..100`
* `lastName`: string, trimmed, length `1..100`
* `email`: valid email
* `personnummer`: one of:

  * `YYMMDD-XXXX`
  * `YYYYMMDD-XXXX`
  * `YYMMDDXXXX`
  * `YYYYMMDDXXXX`

Success (201)

```json
{
  "message": "Account created",
  "data": {
    "user": {
      "userId": 1,
      "username": "username",
      "role": "applicant",
      "personId": 1
    }
  }
}
```

Notes:

* `role` is always created as `"applicant"`.
* Duplicate username returns `CONFLICT` (409).

---

### Login

`POST /auth/login`

Body

```json
{
  "username": "useraname",//useraname??? i assume you just meant username considering that is what it says in the rest of the code
  "password": "password"
}
```

Success (200)

```json
{
  "message": "Login successful",
  "data": {
    "token": "JWT_HERE",
    "role": "applicant"
  }
}
```

Failure (401)

* Invalid credentials => `AUTH_INVALID`

Send token on protected endpoints:

Header

```http
Authorization: Bearer <token>
```

---

### Current user

`GET /auth/me`

Headers

```http
Authorization: Bearer <token>
```

Success (200)

```json
{
  "message": "Current user",
  "data": {
    "user": {
      "userId": 1,
      "role": "applicant",
      "personId": 1
    },
    "person": {
      "personId": 1,
      "firstName": "FName",
      "lastName": "LName",
      "email": "email@example.com"
    }
  }
}
```

Notes:

* `data.person` can be `null` (e.g., if `personId` is missing/unresolved).

---

## Competences (public)

### List competences

`GET /competences`

Success (200)

```json
{
  "message": "Competences retrieved",
  "data": [
    { "id": 1, "code": "JAVA", "name": "Java" },
    { "id": 2, "code": "JS", "name": "JavaScript" }
  ]
}
```

---

## Applications

### Submit application (Applicant)

`POST /applications`

Auth

* Requires token
* Requires role: `applicant`

Headers

```http
Authorization: Bearer <token>
Content-Type: application/json
```

Body

```json
{
  "competences": [
    { "competenceId": 1, "yearsOfExperience": 5.5 }
  ],
  "availability": [
    { "fromDate": "2026-01-01", "toDate": "2026-06-30" }
  ]
}
```

Rules:

* `competences` must be a non-empty array
* `competenceId` must be a positive integer
* `yearsOfExperience` is a number `0..80` (max 2 decimals)
* `availability` must be a non-empty array
* `fromDate` / `toDate` must be ISO dates, and `fromDate <= toDate`

Success (201)

```json
{
  "message": "Application submitted",
  "data": {
    "applicationId": 10,
    "status": "unhandled",
    "submissionDate": "2026-02-02",
    "version": 1
  }
}
```

Notes:

* New applications are created with status `"unhandled"`.
* `submissionDate` is date-only (`YYYY-MM-DD`).

---

### List applications (Recruiter)

`GET /applications`

Auth

* Requires token
* Requires role: `recruiter`

Query params (optional)

* `sortKey`: `submissionDate` | `status` | `fullName` (default `submissionDate`)
* `direction`: `asc` | `desc` (default `desc`)

Example:
`GET /applications?sortKey=fullName&direction=asc`

Success (200)

```json
{
  "message": "Applications retrieved",
  "data": [
    {
      "applicationId": 10,
      "fullName": "FName LName",
      "status": "unhandled",
      "submissionDate": "2026-02-02"
    }
  ]
}
```

Notes:

* Server currently limits recruiter list to max `50` rows.
* `sortKey=fullName` is implemented as last-name sort.

---

### Get application details (Recruiter)

`GET /applications/:id`

Auth

* Requires token
* Requires role: `recruiter`

Path param

* `id` = application id (integer)

Success (200)

```json
{
  "message": "Application retrieved",
  "data": {
    "applicationId": 10,
    "status": "unhandled",
    "submissionDate": "2026-02-02",
    "version": 1,
    "person": {
      "personId": 1,
      "firstName": "FName",
      "lastName": "LName",
      "email": "email@example.com"
    },
    "competences": [
      {
        "competenceId": 1,
        "code": "JAVA",
        "name": "Java",
        "yearsOfExperience": 5.5
      }
    ],
    "availability": [
      { "fromDate": "2026-01-01", "toDate": "2026-06-30" }
    ]
  }
}
```

---

### Update application status (Recruiter, optimistic lock)

`PATCH /applications/:id/status`

Auth

* Requires token
* Requires role: `recruiter`

Headers

```http
Authorization: Bearer <token>
Content-Type: application/json
```

Body

```json
{
  "status": "accepted",
  "version": 1
}
```

Rules:

* Allowed `status` values: `unhandled` | `accepted` | `rejected`
* `version` must match current application version
* On success, server increments version

Success (200)

```json
{
  "message": "Application status updated",
  "data": {
    "applicationId": 10,
    "status": "accepted",
    "version": 2
  }
}
```

Conflict (409)

```json
{
  "error": {
    "code": "CONFLICT",
    "message": "Application status update conflict",
    "details": {
      "applicationId": 10,
      "expectedVersion": 1
    }
  }
}
```

Client handling recommendation:

1. Re-fetch `GET /applications/:id`
2. Retry with the new `version` if appropriate

---

## Health

### Health check

`GET /health`

Success (200)

```json
{
  "message": "Health check",
  "data": { "status": "ok", "db": "ok" }
}
```

Degraded (503) (DB unavailable)

```json
{
  "message": "Health check",
  "data": { "status": "degraded", "db": "down" }
}
```
