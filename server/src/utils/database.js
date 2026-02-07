const { Pool } = require("pg");
const { DbError } = require("../errors");

function buildPoolConfig() {
  const useSsl = process.env.DB_SSL === "true" || !!process.env.DATABASE_URL;

  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: useSsl ? { rejectUnauthorized: false } : false,
    };
  }

  return {
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME || "recruitment_db",
    ssl: useSsl ? { rejectUnauthorized: false } : false,
  };
}

const pool = new Pool(buildPoolConfig());

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
});

async function query(text, params) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log("Executed query", { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    throw new DbError("Database query error", {
      cause: error,
    });
  }
}

async function getClient() {
  const client = await pool.connect();
  return client;
}

async function withTransaction(fn) {
  const client = await getClient();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackErr) {
      console.error("Transaction rollback failed", { rollbackErr });
    }
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  query,
  getClient,
  withTransaction,
  pool,
};
