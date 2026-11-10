/**
 * Scrape Макси store points from maxi.today public API (all cities).
 * Writes GeoJSON with CRM Product tokens for Mapbox tileset upload.
 *
 * Usage: node scripts/scrape-maksi-shops.mjs
 * Source: GET https://maxi.today/api/v1/shops
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outGeo = path.join(root, "tmp/mapbox-sources/maksi.geojson");
const outMeta = path.join(root, "tmp/mapbox-sources/maksi.meta.json");
const outRaw = path.join(root, "tmp/mapbox-sources/maksi-raw.json");

/** Fixture/CRM TRUE SKUs for МАКСИ → map Product tokens */
const PRODUCT = "Ausweis, Blue Monkey, Heidegger Hell, Nut Butter";

const API = "https://maxi.today/api/v1/shops";

const TYPE_LABEL = {
  1: "Супермаркет",
  2: "Гипермаркет",
};

async function main() {
  const res = await fetch(API, {
    headers: { "user-agent": "gletcherbrewery-retail-scrape/1.0" },
  });
  if (!res.ok) {
    throw new Error(`shops API HTTP ${res.status}`);
  }
  const body = await res.json();
  if (body.errorCode !== 0 || !Array.isArray(body.response)) {
    throw new Error(
      `shops API error: ${body.errorMessage || JSON.stringify(body).slice(0, 200)}`,
    );
  }

  fs.mkdirSync(path.dirname(outGeo), { recursive: true });
  fs.writeFileSync(outRaw, JSON.stringify(body, null, 2));

  const cities = {};
  const features = [];
  let skipped = 0;

  for (const s of body.response) {
    const lat = Number(s.lat);
    const lon = Number(s.long);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      skipped += 1;
      continue;
    }
    const city = String(s.city_name || s.city_code || "").trim();
    cities[city] = (cities[city] || 0) + 1;
    const typeLabel =
      TYPE_LABEL[s.type] || (s.type ? String(s.type) : "Магазин");

    features.push({
      type: "Feature",
      id: features.length + 1,
      geometry: { type: "Point", coordinates: [lon, lat] },
      properties: {
        Type: typeLabel,
        Title: "Макси",
        City: city,
        Adress: String(s.address || ""),
        Product: PRODUCT,
        Packing: "",
        SourceId: String(s.id),
        SourceUrl: s.city_code
          ? `https://maxi-retail.ru/${s.city_code}/shops/${s.id}`
          : "https://maxi-retail.ru/",
        RegionCode: String(s.city_code || ""),
        Hours:
          s.works_from && s.works_till
            ? `${s.works_from}-${s.works_till}`
            : "",
      },
    });
  }

  fs.writeFileSync(
    outGeo,
    JSON.stringify({ type: "FeatureCollection", features }),
  );
  fs.writeFileSync(
    outMeta,
    JSON.stringify(
      {
        scrapedAt: new Date().toISOString(),
        source: API,
        site: "https://maxi-retail.ru/",
        chainTitle: "МАКСИ",
        featureCount: features.length,
        skipped,
        product: PRODUCT,
        cities,
        note: "All cities from maxi.today/api/v1/shops; Product from CRM fixture TRUE cells",
      },
      null,
      2,
    ),
  );

  console.log(
    JSON.stringify(
      {
        ok: true,
        features: features.length,
        skipped,
        cities,
        outGeo: path.relative(root, outGeo),
        product: PRODUCT,
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
