const { exec } = require("./db");

/**
 * Inserts a new application row.
 *
 * @param {import("pg").PoolClient} client
 * @param {{personId:number, status:string}} input
 * @returns {Promise<{id:number, person_id:number, status:string, submission_date:string, version:number}>}
 */
async function createApplication(client, { personId, status }) {
  const r = await exec(
    client,
    `
    INSERT INTO application (person_id, status)
    VALUES ($1, $2)
    RETURNING id, person_id, status, submission_date, version
    `,
    [personId, status]
  );
  return r.rows[0];
}

/**
 * Returns recruiter list view of applications.
 * 
 * @param {{
 *   sortKey?: "submissionDate"|"status"|"fullName",
 *   direction?: "asc"|"desc",
 *   status?: "unhandled"|"accepted"|"rejected",
 *   q?: string,
 *   applicationId?: number,
 *   fromDate?: string|Date,
 *   toDate?: string|Date,
 *   limit?: number,
 *   offset?: number
 * }} [options]
 * @returns {Promise<Array<any>>}
 */
async function listForRecruiter({
  sortKey = "submissionDate",
  direction = "desc",
  status,
  q,
  applicationId,
  fromDate,
  toDate,
  limit = 50,
  offset = 0,
} = {}) {
  const dir = String(direction).toLowerCase() === "asc" ? "ASC" : "DESC";

  let orderByClause = `a.submission_date ${dir}`;
  if (sortKey === "status") orderByClause = `a.status ${dir}`;
  if (sortKey === "fullName") orderByClause = `p.last_name ${dir}, p.first_name ${dir}`;

  const where = [];
  const params = [];
  let i = 1;

  if (status) {
    where.push(`a.status = $${i++}`);
    params.push(status);
  }

  if (applicationId) {
    where.push(`a.id = $${i++}`);
    params.push(applicationId);
  }

  if (fromDate) {
    where.push(`a.submission_date >= $${i++}::date`);
    params.push(fromDate);
  }

  if (toDate) {
    where.push(`a.submission_date <= $${i++}::date`);
    params.push(toDate);
  }

  const search = typeof q === "string" ? q.trim() : "";
  if (search) {
    where.push(`
      (
        p.first_name ILIKE $${i}
        OR p.last_name ILIKE $${i}
        OR CONCAT_WS(' ', p.first_name, p.last_name) ILIKE $${i}
        OR p.email ILIKE $${i}
      )
    `);
    params.push(`%${search}%`);
    i += 1;
  }

  const safeLimit = Number.isFinite(Number(limit)) ? Math.min(Math.max(Number(limit), 1), 500) : 50;
  const safeOffset = Number.isFinite(Number(offset)) ? Math.max(Number(offset), 0) : 0;
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

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
      ${whereSql}
      ORDER BY ${orderByClause}, a.id ${dir}
      LIMIT $${i++} OFFSET $${i++}
    `,
    [...params, safeLimit, safeOffset]
  );

  return r.rows;
}

/**
 * Loads full recruiter details for one application.
 *
 * @param {number} applicationId
 * @returns {Promise<null|{application:any, person:any, competences:any[], availability:any[]}>}
 */
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

/**
 * Updates status when the expected row version matches.
 *
 * @param {{applicationId:number, status:string, version:number}} input
 * @returns {Promise<null|{id:number, status:string, version:number}>}
 */
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
