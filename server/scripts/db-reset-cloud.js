#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("Missing DATABASE_URL environment variable.");
  process.exit(1);
}

const ROOT = path.join(__dirname, "..");
const MIGRATION_DIR = path.join(ROOT, "migration");

const RESET_SQL = path.join(MIGRATION_DIR, "00_reset.sql");
const GENERATED_LEGACY = path.join(MIGRATION_DIR, "_generated_existing_to_legacy.sql");
const INIT_SCRIPT = path.join(ROOT, "scripts", "db-init-cloud.js");

function requireFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`Missing file: ${filePath}`);
    process.exit(1);
  }
}

function runPsql(label, args) {
  console.log(`==> ${label}`);
  const r = spawnSync(
    "psql",
    ["--set", "ON_ERROR_STOP=1", "-d", DATABASE_URL, ...args],
    {
      stdio: "inherit",
      env: { ...process.env, PGSSLMODE: "require" },
    }
  );

  if (r.error) {
    console.error(`Failed to execute psql: ${r.error.message}`);
    process.exit(1);
  }
  if (r.status !== 0) {
    process.exit(r.status || 1);
  }
}

function runSql(label, sql) {
  runPsql(label, ["-c", sql]);
}

function deleteIfExists(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Deleted: ${filePath}`);
    }
  } catch (e) {
    console.warn(`Could not delete ${filePath}: ${e.message}`);
  }
}

function runNodeScript(label, scriptPath) {
  console.log(`==> ${label}`);
  const r = spawnSync(process.execPath, [scriptPath], {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL },
  });

  if (r.error) {
    console.error(`Failed to execute ${scriptPath}: ${r.error.message}`);
    process.exit(1);
  }
  if (r.status !== 0) {
    process.exit(r.status || 1);
  }
}

function main() {
  requireFile(RESET_SQL);
  requireFile(INIT_SCRIPT);

  runSql("Clear transaction state", "ROLLBACK;");

  runSql("Ensure public schema exists", "CREATE SCHEMA IF NOT EXISTS public;");

  runPsql("Drop legacy schema + app tables (00_reset.sql)", [
    "-c",
    "SET search_path TO public, pg_catalog;",
    "-f",
    RESET_SQL,
  ]);

  console.log("==> Remove generated legacy SQL (if present)");
  deleteIfExists(GENERATED_LEGACY);

  runNodeScript("Rebuild cloud DB using db-init-cloud.js", INIT_SCRIPT);

  console.log("\nCloud DB reset complete.");
}

main();
