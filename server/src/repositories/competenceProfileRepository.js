const { exec } = require("./db");

async function bulkInsert(client, applicationId, competences) {
  if (!Array.isArray(competences) || competences.length === 0) return;

  const values = [];
  const params = [];
  let i = 1;

  for (const c of competences) {
    values.push(`($${i++}, $${i++}, $${i++})`);
    params.push(applicationId, c.competenceId, c.yearsOfExperience);
  }

  await exec(
    client,
    `INSERT INTO competence_profile (application_id, competence_id, years_of_experience)
     VALUES ${values.join(", ")}`,
    params
  );
}

module.exports = {
  competenceProfileRepository: {
    bulkInsert,
  },
};
