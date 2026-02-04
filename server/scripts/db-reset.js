#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

require("dotenv").config({ path: path.join(__dirname, "..", "src", ".env") });

const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = Number(process.env.DB_PORT || 5432);
const DB_USER = process.env.DB_USER || "recruitment_app";
const DB_PASSWORD = process.env.DB_PASSWORD || "recruitment_app_pw";
const DB_NAME = process.env.DB_NAME || "recruitment_db";

const ROOT = path.join(__dirname, "..");
const MIGRATION_DIR = path.join(ROOT, "migration");

const RESET_SQL = path.join(MIGRATION_DIR, "00_reset.sql");
const GENERATED_LEGACY = path.join(MIGRATION_DIR, "_generated_existing_to_legacy.sql");
const INIT_SCRIPT = path.join(ROOT, "scripts", "db-init.js");

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

function deleteIfExists(filePath) {
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (e) {
    // not fatal
  }
}

async function main() {
  requireFile(RESET_SQL);
  requireFile(INIT_SCRIPT);

  console.log("==> Reset: dropping legacy schema + app tables …");
  run("psql", buildPsqlArgs(DB_NAME, RESET_SQL), { PGPASSWORD: DB_PASSWORD });

  console.log("==> Reset: removing generated legacy SQL (if any) …");
  deleteIfExists(GENERATED_LEGACY);

  console.log("==> Rebuild + migrate …");
  run(process.execPath, [INIT_SCRIPT], { PGPASSWORD: DB_PASSWORD });

  console.log("\nDB reset complete.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});