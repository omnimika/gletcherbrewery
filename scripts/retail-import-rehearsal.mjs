#!/usr/bin/env node
/**
 * M1-0: load CSV/GeoJSON into retail staging + print anomaly report.
 * Usage: npm run retail:import-rehearsal -- fixtures/retail/synthetic-batch.geojson
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

const fileArg = process.argv[2];
if (!fileArg) {
  console.error(
    "Usage: npm run retail:import-rehearsal -- fixtures/retail/synthetic-batch.geojson",
  );
  process.exit(2);
}

const runner = path.join(root, "scripts/retail-import-rehearsal-run.ts");
const tsxCli = path.join(root, "node_modules/tsx/dist/cli.mjs");

const child = spawn(process.execPath, [tsxCli, runner, fileArg], {
  cwd: root,
  env: process.env,
  stdio: "inherit",
});

child.on("exit", (code) => process.exit(code ?? 1));
