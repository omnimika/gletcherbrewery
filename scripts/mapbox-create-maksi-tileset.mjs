/**
 * Create MTS tileset for Макси from staged GeoJSON, then add style layer.
 * Gated: MAPBOX_ALLOW_TILESET_PUBLISH=true + MAPBOX_SECRET_TOKEN (sk.).
 *
 * Usage: node scripts/mapbox-create-maksi-tileset.mjs
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
    if (!(k in process.env) || k.startsWith("MAPBOX_")) process.env[k] = v;
  }
}

const LAYER_ID = "maksi";
const SOURCE_LAYER = "maksi";
const TILESET_NAME = "gletcher-maksi";
const STYLE_ID = "omnicoremaps/cknj3azmg0w2t17qqmylsfz8x";
const geoPath = path.join(root, "tmp/mapbox-sources/maksi.geojson");

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function mapboxJson(url, init) {
  const res = await fetch(url, init);
  const text = await res.text();
  let body = text;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text.slice(0, 800);
  }
  return { status: res.status, body };
}

function featureCollectionToLd(fc) {
  return fc.features.map((f) => JSON.stringify(f)).join("\n") + "\n";
}

async function main() {
  if (process.env.MAPBOX_ALLOW_TILESET_PUBLISH !== "true") {
    throw new Error("MAPBOX_ALLOW_TILESET_PUBLISH must be true");
  }
  const sk = process.env.MAPBOX_SECRET_TOKEN || process.env.MAPBOX_TOKEN;
  if (!sk?.startsWith("sk.")) throw new Error("MAPBOX_SECRET_TOKEN sk.… required");
  const user = process.env.MAPBOX_USERNAME?.trim() || "omnicoremaps";
  if (!fs.existsSync(geoPath)) throw new Error(`missing ${geoPath}`);

  const fc = JSON.parse(fs.readFileSync(geoPath, "utf8"));
  const ld = featureCollectionToLd(fc);
  const sourceId = `gletcher-${LAYER_ID}-${Date.now().toString(36)}`.slice(0, 32);
  const tilesetId = `${user}.${TILESET_NAME}`;

  // 1) tileset-source
  const createSourceUrl = `https://api.mapbox.com/tilesets/v1/sources/${user}/${sourceId}?access_token=${encodeURIComponent(sk)}`;
  const form = new FormData();
  form.append(
    "file",
    new Blob([ld], { type: "application/x-ndjson" }),
    `${LAYER_ID}.geojson.ld`,
  );
  let created = await mapboxJson(createSourceUrl, { method: "POST", body: form });
  if (created.status !== 200 && created.status !== 201) {
    throw new Error(`create source HTTP ${created.status}: ${JSON.stringify(created.body)}`);
  }

  // 2) tileset + recipe (create or update)
  const recipe = {
    version: 1,
    layers: {
      [SOURCE_LAYER]: {
        source: `mapbox://tileset-source/${user}/${sourceId}`,
        minzoom: 0,
        maxzoom: 16,
      },
    },
  };

  const tilesetUrl = `https://api.mapbox.com/tilesets/v1/${tilesetId}?access_token=${encodeURIComponent(sk)}`;
  let tileset = await mapboxJson(tilesetUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      recipe,
      name: "Gletcher Maksi",
      description: "Maxi retail points scraped from maxi.today",
      private: false,
    }),
  });
  if (tileset.status === 409) {
    // already exists — patch recipe
    const recipeUrl = `https://api.mapbox.com/tilesets/v1/${tilesetId}/recipe?access_token=${encodeURIComponent(sk)}`;
    tileset = await mapboxJson(recipeUrl, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(recipe),
    });
    if (tileset.status !== 200 && tileset.status !== 201 && tileset.status !== 204) {
      tileset = await mapboxJson(recipeUrl, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ recipe }),
      });
    }
  }
  if (
    tileset.status !== 200 &&
    tileset.status !== 201 &&
    tileset.status !== 204
  ) {
    throw new Error(`tileset create/update HTTP ${tileset.status}: ${JSON.stringify(tileset.body)}`);
  }

  // 3) publish
  const publishUrl = `https://api.mapbox.com/tilesets/v1/${tilesetId}/publish?access_token=${encodeURIComponent(sk)}`;
  let pub = await mapboxJson(publishUrl, { method: "POST" });
  for (let i = 0; i < 5 && pub.status === 429; i += 1) {
    await sleep(15_000 * (i + 1));
    pub = await mapboxJson(publishUrl, { method: "POST" });
  }
  if (pub.status !== 200 && pub.status !== 201) {
    throw new Error(`publish HTTP ${pub.status}: ${JSON.stringify(pub.body)}`);
  }

  // 4) wait briefly then add style layer if missing
  await sleep(8_000);
  const styleUrl = `https://api.mapbox.com/styles/v1/${STYLE_ID}?access_token=${encodeURIComponent(sk)}`;
  const styleGet = await mapboxJson(styleUrl);
  if (styleGet.status !== 200 || !styleGet.body || typeof styleGet.body !== "object") {
    throw new Error(`style get HTTP ${styleGet.status}`);
  }
  const style = styleGet.body;
  const layers = Array.isArray(style.layers) ? style.layers : [];
  const sources = style.sources && typeof style.sources === "object" ? style.sources : {};
  const sourceKey = `mapbox://${tilesetId}`;
  // Mapbox style sources usually use the tileset url as source id for vector.
  if (!sources[sourceKey] && !Object.values(sources).some((s) => s?.url === sourceKey)) {
    sources[sourceKey] = { type: "vector", url: sourceKey };
  }

  const layerDef = {
    id: LAYER_ID,
    type: "symbol",
    source: sourceKey,
    "source-layer": SOURCE_LAYER,
    layout: {
      "icon-image": "maksi-sm",
      "icon-size": [
        "interpolate",
        ["exponential", 0.9],
        ["zoom"],
        0,
        0.3,
        22,
        1,
      ],
      "icon-allow-overlap": ["step", ["zoom"], false, 11, true],
      "icon-padding": 1,
    },
    paint: {},
  };

  const existingIdx = layers.findIndex((l) => l.id === LAYER_ID);
  if (existingIdx >= 0) {
    layers[existingIdx] = { ...layers[existingIdx], ...layerDef, layout: { ...layers[existingIdx].layout, ...layerDef.layout } };
  } else {
    const after = layers.findIndex((l) => l.id === "aromatny-mir");
    if (after >= 0) layers.splice(after + 1, 0, layerDef);
    else layers.push(layerDef);
  }

  const put = await mapboxJson(styleUrl, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ version: style.version ?? 8, sources, layers }),
  });
  if (put.status !== 200 && put.status !== 201) {
    throw new Error(
      `style update HTTP ${put.status}: ${JSON.stringify(put.body)}`,
    );
  }

  const out = {
    ok: true,
    layerId: LAYER_ID,
    tilesetId,
    tilesetSourceId: sourceId,
    sourceLayer: SOURCE_LAYER,
    styleSource: sourceKey,
    features: fc.features.length,
    publish: pub.body,
  };
  fs.writeFileSync(
    path.join(root, "tmp/mapbox-sources/maksi.tileset.json"),
    JSON.stringify(out, null, 2),
  );
  console.log(JSON.stringify(out, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
