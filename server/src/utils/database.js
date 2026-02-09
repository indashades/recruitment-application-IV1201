const { Pool } = require("pg");
const { DbError } = require("../errors");

const useConnectionString = !!process.env.DATABASE_URL;

/**
 * Shared PostgreSQL connection pool.
 * @type {import("pg").Pool}
 */
const pool = new Pool(
  useConnectionString
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }
    : {
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "postgres",
        host: process.env.DB_HOST || "localhost",
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || "recruitment_db",
      }
);

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
});

/**
 * Executes SQL against the shared pool.
 *
 * @param {string} text
 * @param {any[]} [params]
 * @returns {Promise<import("pg").QueryResult<any>>}
 * @throws {DbError}
 */
async function query(text, params) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log("Executed query", { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    throw new DbError("Database query error", { cause: error });
  }
}

/**
 * Acquires a client from the pool.
 *
 * @returns {Promise<import("pg").PoolClient>}
 */
async function getClient() {
  const client = await pool.connect();
  return client;
}

/**
 * Runs a callback inside a SQL transaction.
 *
 * @template T
 * @param {(client: import("pg").PoolClient) => Promise<T>} fn
 * @returns {Promise<T>}
 */
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
