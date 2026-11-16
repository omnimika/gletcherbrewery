#!/usr/bin/env node
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
    // .env.local wins for Mapbox gates/tokens (parent shell may have stale ALLOW=false)
    if (!(k in process.env) || k.startsWith("MAPBOX_")) process.env[k] = v;
  }
}

const runner = path.join(root, "scripts/retail-tileset-live-run.ts");
const tsxCli = path.join(root, "node_modules/tsx/dist/cli.mjs");
const child = spawn(
  process.execPath,
  [tsxCli, runner, ...process.argv.slice(2)],
  { cwd: root, env: process.env, stdio: "inherit" },
);
child.on("exit", (code) => process.exit(code ?? 1));
