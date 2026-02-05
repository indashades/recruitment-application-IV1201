# API v1

Base URL (local): `http://localhost:3000/api/v1`
All responses are JSON.

## Response formats

### Success

```json
{
  "message": "human readable message",
  "data": { }
}
```

### Error

```json
{
  "error": {
    "code": "STABLE_CODE",
    "message": "human readable message",
    "requestId": "optional-correlation-id",
    "details": { }
  }
}
```

Common error codes:

* `VALIDATION_ERROR` (HTTP 422) – request schema invalid, `error.details.issues` includes field problems
* `BAD_JSON` (HTTP 400) – invalid JSON body
* `AUTH_REQUIRED` (HTTP 401) – missing token
* `AUTH_INVALID` (HTTP 401) – invalid/expired token
* `FORBIDDEN` (HTTP 403) – wrong role
* `NOT_FOUND` (HTTP 404)
* `CONFLICT` (HTTP 409) – optimistic lock conflict
* `DB_ERROR` (HTTP 500) – server-side database issue (message is generic)

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

* `role` is created as `"applicant"` by default.

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

Save the token and send it on protected endpoints:

Header

```
Authorization: Bearer <token>
```

---

### Current user

`GET /auth/me`

Headers

```
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

```
Authorization: Bearer <token>
Content-Type: application/json
```

Body

```json
{
  "competences": [
    { "competenceId": 1, "yearsOfExperience": 5 }
  ],
  "availability": [
    { "fromDate": "2026-01-01", "toDate": "2026-06-30" }
  ]
}
```

Rules:

* `competences` must be a non-empty array
* `yearsOfExperience` is an integer (0–80)
* `availability` must be a non-empty array
* `fromDate` / `toDate` must be ISO date strings; `fromDate <= toDate`

Success (201)

```json
{
  "message": "Application submitted",
  "data": {
    "applicationId": 10,
    "status": "submitted",
    "submissionDate": "2026-02-02T13:35:12.345Z",
    "version": 1
  }
}
```

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
      "status": "submitted",
      "submissionDate": "2026-02-02T13:35:12.345Z"
    }
  ]
}
```

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
    "status": "submitted",
    "submissionDate": "2026-02-02T13:35:12.345Z",
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
        "yearsOfExperience": 5
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

```
Authorization: Bearer <token>
Content-Type: application/json
```

Body

```json
{
  "status": "approved",
  "version": 1
}
```

Rules:

* `version` must match the current application version.
* On success, the server increments version.

Success (200)

```json
{
  "message": "Application status updated",
  "data": {
    "applicationId": 10,
    "status": "approved",
    "version": 2
  }
}
```

Conflict (409)
If someone updated the application in the meantime:

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

---

## Minimal client checklist

* Always parse response as JSON.
* If the response contains `error`, use `error.code` for logic and show `error.message` to the user.
* Send `Authorization: Bearer <token>` for protected routes.