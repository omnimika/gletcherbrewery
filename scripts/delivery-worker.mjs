#!/usr/bin/env node
/**
 * B2 delivery worker. Loads .env.local if present (without printing secrets).
 * Usage:
 *   npm run worker:delivery           # poll forever
 *   npm run worker:delivery -- --once # single batch
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

const once = process.argv.includes("--once");
const runner = path.join(root, "scripts/delivery-worker-run.ts");
const tsxCli = path.join(root, "node_modules/tsx/dist/cli.mjs");

const child = spawn(
  process.execPath,
  [tsxCli, runner, ...(once ? ["--once"] : [])],
  {
    cwd: root,
    env: process.env,
    stdio: "inherit",
  },
);

child.on("exit", (code) => process.exit(code ?? 1));
