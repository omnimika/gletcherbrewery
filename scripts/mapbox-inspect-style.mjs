#!/usr/bin/env node
/**
 * Read-only: list vector sources from the production Mapbox style.
 * Uses NEXT_PUBLIC_MAPBOX_TOKEN (pk) only — never prints the token.
 * Helps confirm tileset IDs before wiring live publish.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

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

const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
if (!token || !token.startsWith("pk.")) {
  console.error("NEXT_PUBLIC_MAPBOX_TOKEN (pk.…) required in .env.local");
  process.exit(1);
}

const styleId = "omnicoremaps/cknj3azmg0w2t17qqmylsfz8x";
const url = `https://api.mapbox.com/styles/v1/${styleId}?access_token=${encodeURIComponent(token)}`;

const res = await fetch(url);
if (!res.ok) {
  console.error(`style fetch failed: ${res.status}`);
  process.exit(1);
}
const style = await res.json();
const sources = style.sources ?? {};
const summary = Object.entries(sources).map(([id, src]) => ({
  id,
  type: src.type,
  url: src.url ?? null,
}));
console.log(JSON.stringify({ styleId, sourceCount: summary.length, sources: summary }, null, 2));
