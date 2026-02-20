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

/**
 * Returns the competence IDs that are missing in the DB.
 * Used as a "data hasn't changed" check before inserts.
 *
 * @param {import("pg").PoolClient|null} client
 * @param {number[]} ids
 * @returns {Promise<number[]>}
 */
async function findMissingIds(client, ids) {
  const unique = Array.from(
    new Set((ids || []).map((x) => Number(x)).filter((x) => Number.isFinite(x)))
  );
  if (unique.length === 0) return [];

  const r = await exec(
    client,
    "SELECT id FROM competence WHERE id = ANY($1::bigint[])",
    [unique]
  );

  const found = new Set(r.rows.map((row) => Number(row.id)));
  return unique.filter((id) => !found.has(id));
}

module.exports = { competenceRepository: { listCompetences, findMissingIds } };