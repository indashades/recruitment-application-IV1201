const { exec } = require("./db");

async function createUserAccount(client, { personId, username, passwordHash, role }) {
  const r = await exec(
    client,
    "INSERT INTO user_account (person_id, username, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, person_id, username, role",
    [personId, username, passwordHash, role]
  );
  return r.rows[0];
}

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
