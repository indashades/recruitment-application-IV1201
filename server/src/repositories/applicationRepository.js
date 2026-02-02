const { exec } = require("./db");

async function createApplication(client, { personId, status, submissionDate }) {
  const r = await exec(
    client,
    "INSERT INTO application (person_id, status, submission_date, version) VALUES ($1, $2, $3, $4) RETURNING id, person_id, status, submission_date, version",
    [personId, status, submissionDate, 1]
  );
  return r.rows[0];
}

async function listForRecruiter({ sortKey = "submissionDate", direction = "desc", limit = 50 }) {
  const dir = String(direction).toLowerCase() === "asc" ? "ASC" : "DESC";

  let orderBy = "a.submission_date";
  if (sortKey === "status") orderBy = "a.status";
  if (sortKey === "fullName") orderBy = "p.last_name";

  const r = await exec(
    null,
    `
      SELECT
        a.id AS application_id,
        a.status,
        a.submission_date,
        p.first_name,
        p.last_name
      FROM application a
      JOIN person p ON p.id = a.person_id
      ORDER BY ${orderBy} ${dir}
      LIMIT $1
    `,
    [limit]
  );

  return r.rows;
}

async function getDetailsForRecruiter(applicationId) {
  const header = await exec(
    null,
    `
      SELECT
        a.id AS application_id,
        a.status,
        a.submission_date,
        a.version,
        p.id AS person_id,
        p.first_name,
        p.last_name,
        p.email
      FROM application a
      JOIN person p ON p.id = a.person_id
      WHERE a.id = $1
    `,
    [applicationId]
  );

  if (header.rows.length === 0) return null;

  const competences = await exec(
    null,
    `
      SELECT
        cp.competence_id,
        cp.years_of_experience,
        c.code,
        c.name
      FROM competence_profile cp
      JOIN competence c ON c.id = cp.competence_id
      WHERE cp.application_id = $1
      ORDER BY c.name ASC
    `,
    [applicationId]
  );

  const availability = await exec(
    null,
    `
      SELECT from_date, to_date
      FROM availability
      WHERE application_id = $1
      ORDER BY from_date ASC
    `,
    [applicationId]
  );

  const row = header.rows[0];
  return {
    application: {
      id: row.application_id,
      status: row.status,
      submission_date: row.submission_date,
      version: row.version,
    },
    person: {
      id: row.person_id,
      first_name: row.first_name,
      last_name: row.last_name,
      email: row.email,
    },
    competences: competences.rows,
    availability: availability.rows,
  };
}

async function updateStatusWithOptimisticLock({ applicationId, status, version }) {
  const r = await exec(
    null,
    `
      UPDATE application
      SET status = $1, version = version + 1
      WHERE id = $2 AND version = $3
      RETURNING id, status, version
    `,
    [status, applicationId, version]
  );
  return r.rows[0] || null;
}

module.exports = {
  applicationRepository: {
    createApplication,
    listForRecruiter,
    getDetailsForRecruiter,
    updateStatusWithOptimisticLock,
  },
};
