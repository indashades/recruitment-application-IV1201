#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { Client } = require("pg");

require("dotenv").config({ path: path.join(__dirname, "..", "src", ".env") });

const { hashPassword } = require(path.join(__dirname, "..", "src", "utils", "password"));

const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = Number(process.env.DB_PORT || 5432);
const DB_USER = process.env.DB_USER || "recruitment_app";
const DB_PASSWORD = process.env.DB_PASSWORD || "recruitment_app_pw";
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

async function hashRecruiterPasswords() {
  const client = new Client({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
  });
  await client.connect();

  const q = await client.query(`
    SELECT p.person_id, p.username, p.password
    FROM legacy.person p
    JOIN legacy.role r ON r.role_id = p.role_id
    WHERE r.name = 'recruiter'
      AND p.username IS NOT NULL
      AND p.password IS NOT NULL
    ORDER BY p.person_id ASC
  `);

  console.log("\nRecruiter credentials from legacy dump (for demo):");
  for (const row of q.rows) {
    console.log(`  username=${row.username}  password=${row.password}`);
  }

  for (const row of q.rows) {
    const pwHash = await hashPassword(row.password);
    await client.query(
      `UPDATE user_account
       SET password_hash = $1, needs_password_reset = FALSE
       WHERE person_id = $2`,
      [pwHash, row.person_id]
    );
  }

  await client.end();
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

  console.log("==> Hashing recruiter passwords into user_account.password_hash …");
  await hashRecruiterPasswords();

  console.log("\nDB init complete.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
