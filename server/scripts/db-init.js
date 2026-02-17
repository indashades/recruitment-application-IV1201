#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { Client } = require("pg");

require("dotenv").config({ path: path.join(__dirname, "..", "src", ".env") });

const { hashPassword } = require(path.join(__dirname, "..", "src", "utils", "password"));

const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = Number(process.env.DB_PORT || 5432);
const DB_USER = process.env.DB_USER || "postgres";
const DB_PASSWORD = process.env.DB_PASSWORD || "postgres";
const DB_NAME = process.env.DB_NAME || "recruitment_db";

const ROOT = path.join(__dirname, "..");
const MIGRATION_DIR = path.join(ROOT, "migration");
const LEGACY_DUMP = path.join(MIGRATION_DIR, "existing-database.sql");
const GENERATED_LEGACY = path.join(MIGRATION_DIR, "_generated_existing_to_legacy.sql");
const NEW_SCHEMA = path.join(MIGRATION_DIR, "01_new_schema.sql");
const COPY_SQL = path.join(MIGRATION_DIR, "02_copy_legacy_to_new.sql");

function run(cmd, args, extraEnv = {}) {
  const r = spawnSync(cmd, args, {
    stdio: "inherit",
    env: { ...process.env, ...extraEnv },
  });
  if (r.status !== 0) process.exit(r.status || 1);
}

function requireFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`Missing file: ${filePath}`);
    process.exit(1);
  }
}

function buildPsqlArgs(dbName, filePath) {
  return [
    "--set", "ON_ERROR_STOP=1",
    "-h", DB_HOST,
    "-p", String(DB_PORT),
    "-U", DB_USER,
    "-d", dbName,
    "-f", filePath,
  ];
}

function generateLegacySql() {
  requireFile(LEGACY_DUMP);
  const raw = fs.readFileSync(LEGACY_DUMP, "utf8");

  const rewritten = [
    "CREATE SCHEMA IF NOT EXISTS legacy;",
    "",
    raw.replace(/\bpublic\./g, "legacy."),
  ].join("\n");

  fs.writeFileSync(GENERATED_LEGACY, rewritten, "utf8");
  console.log(`Generated: ${GENERATED_LEGACY}`);
}

async function syncImportedAccounts() {
  const client = new Client({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
  });
  await client.connect();

  try {
    const reg = await client.query(`
      SELECT
        to_regclass('legacy.person') AS legacy_person,
        to_regclass('legacy.role') AS legacy_role,
        to_regclass('public.user_account') AS user_account
    `);

    const row = reg.rows[0] || {};
    if (!row.legacy_person || !row.legacy_role || !row.user_account) {
      console.log("Skipping imported account sync (required tables not present).");
      return;
    }

    const q = await client.query(`
      SELECT
        p.person_id,
        p.username,
        p.password,
        CASE
          WHEN LOWER(BTRIM(r.name)) = 'recruiter' THEN 'recruiter'
          WHEN LOWER(BTRIM(r.name)) = 'applicant' THEN 'applicant'
          WHEN p.role_id = 1 THEN 'recruiter'
          WHEN p.role_id = 2 THEN 'applicant'
          ELSE 'applicant'
        END AS mapped_role
      FROM legacy.person p
      LEFT JOIN legacy.role r ON r.role_id = p.role_id
      WHERE EXISTS (
        SELECT 1
        FROM public.user_account ua
        WHERE ua.person_id = p.person_id
      )
      ORDER BY p.person_id ASC
    `);

    console.log(`\nImported account rows found: ${q.rows.length}`);

    let hashed = 0;
    let resetRequired = 0;

    for (const r of q.rows) {
      if (r.password && r.password.trim() !== "") {
        const pwHash = await hashPassword(r.password);
        await client.query(
          `UPDATE user_account
             SET password_hash = $1,
                 role = $2,
                 needs_password_reset = FALSE
           WHERE person_id = $3`,
          [pwHash, r.mapped_role, r.person_id]
        );
        hashed += 1;
      } else {
        await client.query(
          `UPDATE user_account
             SET password_hash = NULL,
                 role = $1,
                 needs_password_reset = TRUE
           WHERE person_id = $2`,
          [r.mapped_role, r.person_id]
        );
        resetRequired += 1;
      }
    }

    console.log(`Imported accounts updated: ${q.rows.length} (hashed=${hashed}, reset_required=${resetRequired})`);
  } finally {
    await client.end();
  }
}

async function main() {
  requireFile(NEW_SCHEMA);
  requireFile(COPY_SQL);

  console.log("==> Generating legacy SQL into legacy schema…");
  generateLegacySql();

  console.log("==> Loading legacy dump into schema legacy.* (psql required) …");
  run("psql", buildPsqlArgs(DB_NAME, GENERATED_LEGACY), { PGPASSWORD: DB_PASSWORD });

  console.log("==> Creating new schema (public.*) …");
  run("psql", buildPsqlArgs(DB_NAME, NEW_SCHEMA), { PGPASSWORD: DB_PASSWORD });

  console.log("==> Copying legacy data into new schema …");
  run("psql", buildPsqlArgs(DB_NAME, COPY_SQL), { PGPASSWORD: DB_PASSWORD });

  console.log("==> Syncing imported accounts (roles + password flags + hashes) …");
  await syncImportedAccounts();

  console.log("\nDB init complete.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
