const { competenceRepository } = require("../repositories/competenceRepository");

/**
 * Lists available competences.
 * Route: `GET /api/v1/competences`.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns {Promise<void>} Sends HTTP 200 with competence records.
 */
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
