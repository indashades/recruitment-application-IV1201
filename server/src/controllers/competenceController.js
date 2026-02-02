const { competenceRepository } = require("../repositories/competenceRepository");

async function listCompetences(req, res) {
  const rows = await competenceRepository.listCompetences();
  const data = rows.map((r) => ({
    id: r.id,
    code: r.code,
    name: r.name,
  }));

  res.json({
    message: "Competences retrieved",
    data,
  });
}

module.exports = { listCompetences };
