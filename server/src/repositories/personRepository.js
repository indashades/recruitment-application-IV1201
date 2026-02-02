const { exec } = require("./db");

async function createPerson(client, { firstName, lastName, email, personnummer }) {
  const r = await exec(
    client,
    "INSERT INTO person (first_name, last_name, email, personnummer) VALUES ($1, $2, $3, $4) RETURNING id, first_name, last_name, email",
    [firstName, lastName, email, personnummer]
  );
  return r.rows[0];
}

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
