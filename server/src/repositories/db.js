const { query } = require("../utils/database");
const { DbError } = require("../errors");

async function exec(client, text, params) {
  try {
    if (client) return await client.query(text, params);
    return await query(text, params);
  } catch (err) {
    if (err && err.name === "DbError") throw err;
    throw new DbError("Database query error", { cause: err });
  }
}

module.exports = { exec };
