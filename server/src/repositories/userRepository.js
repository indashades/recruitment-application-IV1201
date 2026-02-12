const { exec } = require("./db");

/**
 * Creates a user account record.
 *
 * @param {import("pg").PoolClient} client
 * @param {{personId:number, username:string, passwordHash:string, role:string}} input
 * @returns {Promise<{id:number, person_id:number, username:string, role:string}>}
 */
async function createUserAccount(client, { personId, username, passwordHash, role }) {
  const r = await exec(
    client,
    "INSERT INTO user_account (person_id, username, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, person_id, username, role",
    [personId, username, passwordHash, role]
  );
  return r.rows[0];
}

/**
 * Finds a user account by username.
 *
 * @param {string} username
 * @returns {Promise<null|{id:number, person_id:number, username:string, password_hash:string, role:string}>}
 */
async function findByUsername(username) {
  const r = await exec(
    null,
    `SELECT id, person_id, username, password_hash, role, needs_password_reset
     FROM user_account
     WHERE username = $1`,
    [username]
  );
  return r.rows[0] || null;
}

/**
 * Finds a user account by username OR person email.
 * Username match is prioritized when both could match.
 *
 * @param {string} identifier
 * @returns {Promise<null|{
 *   id:number,
 *   person_id:number,
 *   username:string|null,
 *   password_hash:string|null,
 *   role:string,
 *   needs_password_reset:boolean,
 *   email:string|null
 * }>}
 */
async function findByIdentifier(identifier) {
  const r = await exec(
    null,
    `
      SELECT
        ua.id,
        ua.person_id,
        ua.username,
        ua.password_hash,
        ua.role,
        ua.needs_password_reset,
        p.email
      FROM user_account ua
      LEFT JOIN person p ON p.id = ua.person_id
      WHERE ua.username = $1 OR LOWER(p.email) = LOWER($1)
      ORDER BY CASE WHEN ua.username = $1 THEN 0 ELSE 1 END
      LIMIT 1
    `,
    [identifier]
  );
  return r.rows[0] || null;
}

/**
 * Sets a new password hash and clears password-reset requirement.
 *
 * @param {import("pg").PoolClient} client
 * @param {{userId:number, passwordHash:string}} input
 * @returns {Promise<null|{id:number, person_id:number, username:string|null, role:string, needs_password_reset:boolean}>}
 */
async function setPasswordAndClearResetFlag(client, { userId, passwordHash }) {
  const r = await exec(
    client,
    `UPDATE user_account SET password_hash = $1, needs_password_reset = FALSE WHERE id = $2 RETURNING id, person_id, username, role, needs_password_reset`,
    [passwordHash, userId]
  );
  return r.rows[0] || null;
}

module.exports = {
  userRepository: {
    createUserAccount,
    findByUsername,
    findByIdentifier,
    setPasswordAndClearResetFlag,
  },
};
