const { exec } = require("./db");

async function listCompetences() {
  const r = await exec(
    null,
    "SELECT id, code, name FROM competence ORDER BY name ASC",
    []
  );
  return r.rows;
}

module.exports = { competenceRepository: { listCompetences } };
