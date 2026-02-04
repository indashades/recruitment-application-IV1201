BEGIN;

CREATE TABLE IF NOT EXISTS schema_migrations (
  id TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS person (
  id BIGSERIAL PRIMARY KEY,
  first_name   TEXT NOT NULL,
  last_name    TEXT NOT NULL,
  email        TEXT NULL,
  personnummer TEXT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS person_email_uq
  ON person(email) WHERE email IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS person_personnummer_uq
  ON person(personnummer) WHERE personnummer IS NOT NULL;

CREATE TABLE IF NOT EXISTS user_account (
  id BIGSERIAL PRIMARY KEY,
  person_id BIGINT NOT NULL REFERENCES person(id) ON DELETE CASCADE,
  username TEXT NULL,
  password_hash TEXT NULL,
  role TEXT NOT NULL CHECK (role IN ('applicant','recruiter')),
  needs_password_reset BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS user_account_username_uq
  ON user_account(username) WHERE username IS NOT NULL;

CREATE TABLE IF NOT EXISTS application (
  id BIGSERIAL PRIMARY KEY,
  person_id BIGINT NOT NULL REFERENCES person(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('unhandled','accepted','rejected')),
  submission_date DATE NOT NULL DEFAULT CURRENT_DATE,
  version INTEGER NOT NULL DEFAULT 1
);

ALTER TABLE application
  ADD COLUMN IF NOT EXISTS submission_date date NOT NULL DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS version integer NOT NULL DEFAULT 1;

CREATE INDEX IF NOT EXISTS application_person_id_idx ON application(person_id);
CREATE INDEX IF NOT EXISTS application_submission_date_idx ON application(submission_date);

CREATE TABLE IF NOT EXISTS competence (
  id BIGSERIAL PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS competence_code_uq ON competence(code);

CREATE TABLE IF NOT EXISTS competence_profile (
  application_id BIGINT NOT NULL REFERENCES application(id) ON DELETE CASCADE,
  competence_id BIGINT NOT NULL REFERENCES competence(id) ON DELETE RESTRICT,
  years_of_experience NUMERIC(4,2) NOT NULL,
  PRIMARY KEY (application_id, competence_id)
);

CREATE TABLE IF NOT EXISTS availability (
  application_id BIGINT NOT NULL REFERENCES application(id) ON DELETE CASCADE,
  from_date DATE NOT NULL,
  to_date DATE NOT NULL,
  CHECK (to_date >= from_date)
);

CREATE UNIQUE INDEX IF NOT EXISTS availability_uq
  ON availability(application_id, from_date, to_date);

CREATE INDEX IF NOT EXISTS availability_application_id_idx ON availability(application_id);

COMMIT;