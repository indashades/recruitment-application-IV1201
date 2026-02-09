const { query } = require("../utils/database");
const { DbError } = require("../errors");

/**
 * Executes SQL using a transaction client when provided, otherwise pool query helper.
 *
 * @param {import("pg").PoolClient|null} client
 * @param {string} text
 * @param {any[]} [params]
 * @returns {Promise<import("pg").QueryResult<any>>}
 * @throws {DbError}
 */
async function exec(client, text, params) {
  try {
    if (client) return await client.query(text, params);
    return await query(text, params);
  } catch (err) {
    const root = (err instanceof DbError && err.cause) ? err.cause : err;

    console.error("PG ERROR:", {
      message: root && root.message,
      code: root && root.code,
      detail: root && root.detail,
      where: root && root.where,
    });
    console.error("QUERY:", { text, params });
    if (err instanceof DbError) throw err;
    throw new DbError("Database query error", { cause: err });
  }
}

module.exports = { exec };
