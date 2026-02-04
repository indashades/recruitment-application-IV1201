BEGIN;

INSERT INTO person (id, first_name, last_name, email, personnummer)
SELECT
  p.person_id,
  p.name,
  p.surname,
  p.email,
  p.pnr
FROM legacy.person p
ON CONFLICT (id) DO NOTHING;

INSERT INTO competence (id, code, name)
SELECT
  c.competence_id,
  trim(both '_' from regexp_replace(upper(c.name), '[^A-Z0-9]+', '_', 'g')) AS code,
  c.name
FROM legacy.competence c
ON CONFLICT (id) DO NOTHING;

INSERT INTO application (id, person_id, status, submission_date, version)
SELECT
  p.person_id,
  p.person_id,
  'unhandled',
  CURRENT_DATE,
  1
FROM legacy.person p
ON CONFLICT (id) DO NOTHING;

INSERT INTO user_account (person_id, username, password_hash, role, needs_password_reset)
SELECT
  p.person_id,
  p.username,
  NULL,
  r.name,
  (p.password IS NULL)
FROM legacy.person p
JOIN legacy.role r ON r.role_id = p.role_id
ON CONFLICT DO NOTHING;

INSERT INTO competence_profile (application_id, competence_id, years_of_experience)
SELECT
  cp.person_id,
  cp.competence_id,
  cp.years_of_experience
FROM legacy.competence_profile cp
ON CONFLICT (application_id, competence_id) DO NOTHING;

INSERT INTO availability (application_id, from_date, to_date)
SELECT
  a.person_id,
  a.from_date,
  a.to_date
FROM legacy.availability a
ON CONFLICT (application_id, from_date, to_date) DO NOTHING;

SELECT setval(pg_get_serial_sequence('person','id'),      (SELECT COALESCE(MAX(id), 1) FROM person));
SELECT setval(pg_get_serial_sequence('competence','id'),  (SELECT COALESCE(MAX(id), 1) FROM competence));
SELECT setval(pg_get_serial_sequence('application','id'), (SELECT COALESCE(MAX(id), 1) FROM application));

COMMIT;
