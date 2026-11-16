/**
 * Build ХМЕЛЬ И СОЛОД point dump from Tilda map markers on xmel-solod.ru/adress.
 *
 * Primary path: reuse tmp/mapbox-sources/hmel-i-solod-raw.json (browser CDP dump
 * of window.arMapMarkers270361845). Optional --fetch re-downloads the page and
 * extracts the same marker array via regex (no headless browser required).
 *
 * Usage:
 *   node scripts/scrape-hmel-i-solod-shops.mjs
 *   node scripts/scrape-hmel-i-solod-shops.mjs --fetch
 *
 * Writes: hmel-i-solod.geojson / .csv / .meta.json under tmp/mapbox-sources/
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "tmp/mapbox-sources");
const outGeo = path.join(outDir, "hmel-i-solod.geojson");
const outCsv = path.join(outDir, "hmel-i-solod.csv");
const outMeta = path.join(outDir, "hmel-i-solod.meta.json");
const outRaw = path.join(outDir, "hmel-i-solod-raw.json");

const SOURCE_URL = "https://xmel-solod.ru/adress";
/** Fixture/CRM TRUE SKUs → map Product tokens (fixtures/retail/chain-assortment.csv) */
const PRODUCT =
  "Ausweis, Bowler IPA, Heidegger Hell, Nut Butter, Milk of Amnesia, Milk of Amnesia non-alcoholic, Rouge de Fleur";
const TITLE = "ХМЕЛЬ И СОЛОД";

function decodeHtml(s) {
  return String(s || "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

function stripHtml(html) {
  return decodeHtml(html)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function shopType(descr) {
  if (descr.includes("магазин-бар")) return "Магазин-бар";
  if (descr.startsWith("магазин") || descr.includes("магазин")) return "Магазин";
  return "Магазин";
}

function parseCityAdress(title) {
  const t = String(title || "").trim();
  const m = t.match(
    /^(Клин|Звенигород|Ивантеевка|Королев|Домодедово|Дзержинский|Зеленоград|Щербинка|Внуковское|Большие Вяземы|мик\. Град Московский|г\. Московский)[, ]+(.*)$/i,
  );
  if (m) {
    let city = m[1]
      .replace(/мик\.\s*Град Московский/i, "Московский")
      .replace(/^г\.\s*Московский/i, "Московский");
    return { city, adress: m[2].trim() || t };
  }
  return { city: "Москва", adress: t };
}

function markersFromPageHtml(html) {
  const keyMatch = html.match(/arMapMarkers(\d+)\s*=/);
  if (!keyMatch) {
    throw new Error("arMapMarkers* assignment not found in page HTML");
  }
  const re = new RegExp(
    `arMapMarkers${keyMatch[1]}\\s*=\\s*(\\[.*?\\]);`,
    "s",
  );
  const m = html.match(re);
  if (!m) throw new Error(`failed to extract arMapMarkers${keyMatch[1]} array`);
  const arr = JSON.parse(m[1]);
  if (!Array.isArray(arr)) throw new Error("marker payload is not an array");
  return arr.map((row, i) => ({
    id: i + 1,
    title: row.title || "",
    descr: stripHtml(row.descr || ""),
    lat: row.lat,
    lng: row.lng,
    isHidden: Boolean(row.isHidden),
  }));
}

async function loadRaw(fetchPage) {
  if (fetchPage) {
    const res = await fetch(SOURCE_URL, {
      headers: { "user-agent": "gletcherbrewery-retail-scrape/1.0" },
    });
    if (!res.ok) throw new Error(`page HTTP ${res.status}`);
    const html = await res.text();
    const markers = markersFromPageHtml(html);
    const payload = {
      scrapedAt: new Date().toISOString(),
      source: SOURCE_URL,
      markers,
      addressListCount: null,
      addressList: [],
      note: "Fetched via HTML regex; address list not parsed in --fetch mode",
    };
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(outRaw, JSON.stringify(payload, null, 2));
    return payload;
  }
  if (!fs.existsSync(outRaw)) {
    throw new Error(
      `missing ${outRaw} — dump markers via browser or pass --fetch`,
    );
  }
  return JSON.parse(fs.readFileSync(outRaw, "utf8"));
}

function buildFeatures(markers) {
  const features = [];
  const byXy = new Map();
  for (const m of markers) {
    if (m.isHidden) continue;
    const lat = Number(m.lat);
    const lng = Number(m.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    const { city, adress } = parseCityAdress(m.title);
    const feature = {
      type: "Feature",
      geometry: { type: "Point", coordinates: [lng, lat] },
      properties: {
        Type: shopType(m.descr || ""),
        Title: TITLE,
        City: city,
        Adress: adress,
        Product: PRODUCT,
        Packing: "",
        Hours: m.descr || "",
        SourceId: String(m.id),
      },
    };
    features.push(feature);
    const key = `${lng.toFixed(6)},${lat.toFixed(6)}`;
    if (!byXy.has(key)) byXy.set(key, []);
    byXy.get(key).push(adress);
  }
  const duplicateCoordinates = [...byXy.entries()]
    .filter(([, list]) => list.length > 1)
    .map(([coords, adresses]) => ({
      coordinates: coords.split(",").map(Number),
      adresses,
    }));
  return { features, duplicateCoordinates };
}

function writeCsv(features) {
  const header = [
    "Type",
    "Title",
    "City",
    "Adress",
    "Product",
    "Packing",
    "Longitude",
    "Latitude",
    "Hours",
    "SourceId",
  ];
  const lines = [header.join(",")];
  for (const f of features) {
    const p = f.properties;
    const [lng, lat] = f.geometry.coordinates;
    const row = [
      p.Type,
      p.Title,
      p.City,
      p.Adress,
      p.Product,
      p.Packing,
      lng,
      lat,
      p.Hours,
      p.SourceId,
    ].map((v) => {
      const s = String(v ?? "");
      return /["\n,]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    });
    lines.push(row.join(","));
  }
  fs.writeFileSync(outCsv, lines.join("\n") + "\n");
}

async function main() {
  const fetchPage = process.argv.includes("--fetch");
  const raw = await loadRaw(fetchPage);
  const markers = Array.isArray(raw.markers) ? raw.markers : [];
  const { features, duplicateCoordinates } = buildFeatures(markers);

  const typeCounts = {};
  for (const f of features) {
    const t = f.properties.Type;
    typeCounts[t] = (typeCounts[t] || 0) + 1;
  }

  const fc = { type: "FeatureCollection", features };
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outGeo, JSON.stringify(fc));
  writeCsv(features);

  const meta = {
    scrapedAt: raw.scrapedAt || new Date().toISOString(),
    sourceUrl: raw.source || SOURCE_URL,
    source: "Tilda arMapMarkers on xmel-solod.ru/adress",
    featureCount: features.length,
    addressListCount: raw.addressListCount ?? null,
    addressListNotOnMap:
      typeof raw.addressListCount === "number"
        ? raw.addressListCount - features.length
        : null,
    note:
      "Map pins only. Page address list may list more stores without coordinates — not auto-geocoded. Duplicate source coordinates kept and flagged.",
    titleProperty: TITLE,
    crmTitle: TITLE,
    product: PRODUCT,
    duplicateCoordinates,
    typeCounts,
  };
  fs.writeFileSync(outMeta, JSON.stringify(meta, null, 2));
  console.log(JSON.stringify(meta, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
