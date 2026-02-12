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

CREATE TABLE IF NOT EXISTS auth_recovery_token (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES user_account(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  purpose TEXT NOT NULL CHECK (purpose IN ('set_password','reset_password')),
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ NULL,
  request_ip TEXT NULL,
  request_user_agent TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS auth_recovery_token_token_hash_uq
  ON auth_recovery_token(token_hash);

CREATE INDEX IF NOT EXISTS auth_recovery_token_user_id_idx
  ON auth_recovery_token(user_id);

CREATE INDEX IF NOT EXISTS auth_recovery_token_active_by_user_idx
  ON auth_recovery_token(user_id, expires_at DESC)
  WHERE used_at IS NULL;

CREATE TABLE IF NOT EXISTS event_log (
  id BIGSERIAL PRIMARY KEY,

  ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  level TEXT NOT NULL CHECK (level IN ('debug','info','warn','error')) DEFAULT 'info',

  event TEXT NOT NULL,

  request_id TEXT NULL,

  actor_user_id BIGINT NULL REFERENCES user_account(id) ON DELETE SET NULL,
  actor_person_id BIGINT NULL REFERENCES person(id) ON DELETE SET NULL,

  method TEXT NULL,
  path TEXT NULL,
  status INTEGER NULL,

  ip TEXT NULL,
  user_agent TEXT NULL,

  payload JSONB NULL
);

CREATE INDEX IF NOT EXISTS event_log_ts_idx ON event_log (ts DESC);
CREATE INDEX IF NOT EXISTS event_log_event_idx ON event_log (event);
CREATE INDEX IF NOT EXISTS event_log_request_id_idx ON event_log (request_id);
CREATE INDEX IF NOT EXISTS event_log_actor_user_id_idx ON event_log (actor_user_id);

CREATE UNIQUE INDEX IF NOT EXISTS user_account_username_uq
  ON user_account(username) WHERE username IS NOT NULL;

CREATE TABLE IF NOT EXISTS application (
  id BIGSERIAL PRIMARY KEY,
  person_id BIGINT NOT NULL REFERENCES person(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('unhandled','accepted','rejected')),
  submission_date DATE NOT NULL DEFAULT CURRENT_DATE,
  version INTEGER NOT NULL DEFAULT 1
);

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

CREATE INDEX IF NOT EXISTS availability_application_id_idx
  ON availability(application_id);

INSERT INTO competence (code, name) VALUES
  ('TICKET', 'Ticket sales'),
  ('LOTTERY', 'Lotteries'),
  ('ROLLER', 'Roller coaster operation')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name;
