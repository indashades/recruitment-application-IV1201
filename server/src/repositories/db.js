const { query } = require("../utils/database");
const { DbError } = require("../errors");

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
  };
  console.error("QUERY:", { text, params });
  if (err instanceof DbError) throw err;
  throw new DbError("Database query error", { cause: err });
}

module.exports = { exec };
