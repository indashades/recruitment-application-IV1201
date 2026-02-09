const { exec } = require("./db");

/**
 * Reads all competences ordered alphabetically.
 *
 * @returns {Promise<Array<{id:number, code:string, name:string}>>}
 */
async function listCompetences() {
  const r = await exec(
    null,
    "SELECT id, code, name FROM competence ORDER BY name ASC",
    []
  );
  return r.rows;
}

module.exports = { competenceRepository: { listCompetences } };
