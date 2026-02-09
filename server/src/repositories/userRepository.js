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
    "SELECT id, person_id, username, password_hash, role FROM user_account WHERE username = $1",
    [username]
  );
  return r.rows[0] || null;
}

module.exports = {
  userRepository: {
    createUserAccount,
    findByUsername,
  },
};
