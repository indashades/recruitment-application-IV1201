const { exec } = require("./db");

/**
 * Creates a new person record.
 *
 * @param {import("pg").PoolClient} client
 * @param {{firstName:string, lastName:string, email:string, personnummer:string}} input
 * @returns {Promise<{id:number, first_name:string, last_name:string, email:string}>}
 */
async function createPerson(client, { firstName, lastName, email, personnummer }) {
  const r = await exec(
    client,
    "INSERT INTO person (first_name, last_name, email, personnummer) VALUES ($1, $2, $3, $4) RETURNING id, first_name, last_name, email",
    [firstName, lastName, email, personnummer]
  );
  return r.rows[0];
}

/**
 * Reads display-safe person fields by id.
 *
 * @param {number} personId
 * @returns {Promise<null|{id:number, first_name:string, last_name:string, email:string}>}
 */
async function getPersonDisplayById(personId) {
  const r = await exec(
    null,
    "SELECT id, first_name, last_name, email FROM person WHERE id = $1",
    [personId]
  );
  return r.rows[0] || null;
}

module.exports = {
  personRepository: {
    createPerson,
    getPersonDisplayById,
  },
};
