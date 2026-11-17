#!/usr/bin/env node
/**
 * M2-4: import protected Airtable CSV dump from tmp/Airtable (gitignored).
 * Usage:
 *   npm run loyalty:import-airtable-csv -- tmp/Airtable
 *   npm run loyalty:import-airtable-csv -- tmp/Airtable --mode=apply
 * Never prints emails/phones.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const envPath = path.join(root, ".env.local");

if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#") || !t.includes("=")) continue;
    const i = t.indexOf("=");
    const k = t.slice(0, i);
    const v = t.slice(i + 1);
    if (!(k in process.env)) process.env[k] = v;
  }
}

const args = process.argv.slice(2);
if (!args[0]) {
  console.error(
    "Usage: npm run loyalty:import-airtable-csv -- tmp/Airtable [--mode=dry_run|apply]",
  );
  process.exit(2);
}

const runner = path.join(root, "scripts/loyalty-import-airtable-csv-run.ts");
const tsxCli = path.join(root, "node_modules/tsx/dist/cli.mjs");

const child = spawn(process.execPath, [tsxCli, runner, ...args], {
  cwd: root,
  env: process.env,
  stdio: "inherit",
});

child.on("exit", (code) => process.exit(code ?? 1));
