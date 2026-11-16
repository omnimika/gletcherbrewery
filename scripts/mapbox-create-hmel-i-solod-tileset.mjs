/**
 * Create MTS tileset for ХМЕЛЬ И СОЛОД from staged GeoJSON, then add style layer.
 * Gated: MAPBOX_ALLOW_TILESET_PUBLISH=true + MAPBOX_SECRET_TOKEN / MAPBOX_TOKEN (sk.).
 *
 * Usage: node scripts/mapbox-create-hmel-i-solod-tileset.mjs
 *
 * Icon: circle layer until Studio sprite `hmel-i-solod-sm` is uploaded
 * (logo at public/staff/retail-logos/hmel-i-solod-sm.png).
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

const LAYER_ID = "hmel-i-solod";
const SOURCE_LAYER = "hmel-i-solod";
const TILESET_NAME = "gletcher-hmel-i-solod";
const STYLE_ID = "omnicoremaps/cknj3azmg0w2t17qqmylsfz8x";
const geoPath = path.join(root, "tmp/mapbox-sources/hmel-i-solod.geojson");

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
      name: "Gletcher Hmel i Solod",
      description: "Hmel i Solod points from xmel-solod.ru/adress Tilda markers",
      private: false,
    }),
  });
  if (tileset.status === 409) {
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

  const publishUrl = `https://api.mapbox.com/tilesets/v1/${tilesetId}/publish?access_token=${encodeURIComponent(sk)}`;
  let pub = await mapboxJson(publishUrl, { method: "POST" });
  for (let i = 0; i < 5 && pub.status === 429; i += 1) {
    await sleep(15_000 * (i + 1));
    pub = await mapboxJson(publishUrl, { method: "POST" });
  }
  if (pub.status !== 200 && pub.status !== 201) {
    throw new Error(`publish HTTP ${pub.status}: ${JSON.stringify(pub.body)}`);
  }

  // Wait for processing before style patch
  for (let i = 0; i < 24; i += 1) {
    await sleep(5_000);
    const jobUrl = `https://api.mapbox.com/tilesets/v1/${tilesetId}/jobs?limit=1&access_token=${encodeURIComponent(sk)}`;
    const jobs = await mapboxJson(jobUrl);
    const latest = Array.isArray(jobs.body) ? jobs.body[0] : null;
    const stage = latest?.stage || latest?.status;
    if (stage === "success" || stage === "failed" || stage === "canceled") {
      if (stage !== "success") {
        throw new Error(`tileset job ${stage}: ${JSON.stringify(latest)}`);
      }
      break;
    }
  }

  const styleUrl = `https://api.mapbox.com/styles/v1/${STYLE_ID}?access_token=${encodeURIComponent(sk)}`;
  const styleGet = await mapboxJson(styleUrl);
  if (styleGet.status !== 200 || !styleGet.body || typeof styleGet.body !== "object") {
    throw new Error(`style get HTTP ${styleGet.status}`);
  }
  const style = styleGet.body;
  const layers = Array.isArray(style.layers) ? style.layers : [];
  const sources = style.sources && typeof style.sources === "object" ? style.sources : {};
  const sourceKey = `mapbox://${tilesetId}`;
  if (!sources[sourceKey] && !Object.values(sources).some((s) => s?.url === sourceKey)) {
    sources[sourceKey] = { type: "vector", url: sourceKey };
  }

  // Circle until Studio sprite icon is ready (logo exists in staff retail logos).
  const layerDef = {
    id: LAYER_ID,
    type: "circle",
    source: sourceKey,
    "source-layer": SOURCE_LAYER,
    paint: {
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["zoom"],
        4,
        3,
        12,
        7,
        16,
        10,
      ],
      "circle-color": "#2f6b3a",
      "circle-stroke-width": 1,
      "circle-stroke-color": "#ffffff",
    },
  };

  const existingIdx = layers.findIndex((l) => l.id === LAYER_ID);
  if (existingIdx >= 0) {
    layers[existingIdx] = { ...layers[existingIdx], ...layerDef, paint: { ...layers[existingIdx].paint, ...layerDef.paint } };
  } else {
    const after = layers.findIndex((l) => l.id === "yarche");
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
    layerType: "circle",
    iconNote: "Replace with symbol + hmel-i-solod-sm sprite in Studio when ready",
  };
  fs.writeFileSync(
    path.join(root, "tmp/mapbox-sources/hmel-i-solod.tileset.json"),
    JSON.stringify(out, null, 2),
  );
  console.log(JSON.stringify(out, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
