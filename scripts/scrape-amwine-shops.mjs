/**
 * Scrape Ароматный Мир store points from amwine.ru across ALL regions.
 * Uses Bitrix component action aero:shops.list getStores per region code
 * (storeInitState.shops alone is only the currently selected region).
 *
 * Writes GeoJSON with CRM Product tokens for Mapbox tileset upload.
 *
 * Usage: node scripts/scrape-amwine-shops.mjs
 * Needs: Chrome at default macOS path (or CHROME_PATH).
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outGeo = path.join(root, "tmp/mapbox-sources/aromatny-mir.geojson");
const outMeta = path.join(root, "tmp/mapbox-sources/aromatny-mir.meta.json");
const outRaw = path.join(
  root,
  "tmp/mapbox-sources/aromatny-mir-raw/all-regions.json",
);

/** Fixture/CRM TRUE SKUs for АРОМАТНЫЙ МИР → map Product tokens */
const PRODUCT =
  "Blue Monkey, Brainstorm, Nut Butter, Milk of Amnesia";

const CHROME =
  process.env.CHROME_PATH ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function cdp(wsUrl) {
  if (typeof WebSocket === "undefined") {
    throw new Error("Node WebSocket required (Node 22+)");
  }
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    let id = 0;
    const pending = new Map();
    const send = (m, p = {}) =>
      new Promise((res, rej) => {
        const mid = ++id;
        pending.set(mid, { res, rej });
        ws.send(JSON.stringify({ id: mid, method: m, params: p }));
      });
    ws.addEventListener("open", () => {
      (async () => {
        try {
          await send("Page.enable");
          await send("Runtime.enable");
          await send("Page.navigate", {
            url: "https://amwine.ru/customers/shops/",
          });
          await sleep(6000);
          await send("Runtime.evaluate", {
            expression: `(() => {
              const btn = [...document.querySelectorAll('button')]
                .find(b => /Подтверждаю/i.test(b.textContent || ''));
              if (btn) btn.click();
              return Boolean(btn);
            })()`,
            returnByValue: true,
          });
          await sleep(3000);
          await send("Runtime.evaluate", {
            expression: `(() => {
              const btn = [...document.querySelectorAll('button')]
                .find(b => b.textContent?.trim() === 'Хорошо');
              if (btn) btn.click();
              return Boolean(btn);
            })()`,
            returnByValue: true,
          });
          await sleep(2500);

          // Wait for Vue shop store + regions list
          for (let i = 0; i < 40; i++) {
            const ready = await send("Runtime.evaluate", {
              expression: `Boolean(window.appShopsStore?.getters?.['regions/list']?.length && window.BX?.ajax?.runComponentAction)`,
              returnByValue: true,
            });
            if (ready.result?.value) break;
            await sleep(500);
          }

          const result = await send("Runtime.evaluate", {
            expression: `(async () => {
              const store = window.appShopsStore;
              if (!store) return { ok: false, error: 'no appShopsStore' };
              const regions = store.getters['regions/list'] || [];
              if (!regions.length) return { ok: false, error: 'empty regions/list' };

              const byRegion = {};
              const errors = [];
              for (const region of regions) {
                try {
                  const response = await BX.ajax.runComponentAction(
                    'aero:shops.list',
                    'getStores',
                    {
                      mode: 'class',
                      data: {
                        params: {
                          REGION_CODE: region.code,
                          PRODUCT_ID: null,
                          SHOW_STOCK: 'N',
                          CACHE_TIME: '3600',
                        },
                      },
                    },
                  );
                  const shops = response?.data?.SHOPS || {};
                  const list = Object.values(shops);
                  byRegion[region.code] = {
                    name: region.name,
                    count: list.length,
                    shops: list,
                  };
                } catch (e) {
                  errors.push({
                    code: region.code,
                    message: String(e?.message || e),
                  });
                }
              }

              const seen = new Set();
              const shops = [];
              for (const [code, pack] of Object.entries(byRegion)) {
                for (const shop of pack.shops) {
                  const id = String(shop.id || shop.xml_id || '');
                  if (!id || seen.has(id)) continue;
                  seen.add(id);
                  shops.push({
                    id: String(shop.id || ''),
                    xml_id: String(shop.xml_id || ''),
                    name: shop.name || '',
                    address: shop.address || '',
                    location: shop.location || null,
                    url: shop.url || '',
                    active: shop.active || '',
                    regionCode: code,
                    regionName: pack.name,
                  });
                }
              }

              return {
                ok: true,
                shops,
                regionCounts: Object.fromEntries(
                  Object.entries(byRegion).map(([k, v]) => [
                    k,
                    { name: v.name, count: v.count },
                  ]),
                ),
                errors,
              };
            })()`,
            returnByValue: true,
            awaitPromise: true,
          });
          resolve(result.result?.value ?? result);
        } catch (e) {
          reject(e);
        } finally {
          ws.close();
        }
      })();
    });
    ws.addEventListener("message", (ev) => {
      const msg = JSON.parse(String(ev.data));
      if (msg.id && pending.has(msg.id)) {
        const { res, rej } = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) rej(new Error(JSON.stringify(msg.error)));
        else res(msg.result);
      }
    });
    ws.addEventListener("error", () => reject(new Error("CDP WebSocket error")));
  });
}

function httpGetJson(url) {
  return new Promise((resolve, reject) => {
    http
      .get(url, (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on("error", reject);
  });
}

function toFeatures(shops) {
  const features = [];
  for (const s of shops) {
    const lat = Number(s.location?.lat);
    const lon = Number(s.location?.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    const city =
      String(s.name || "").split(",")[0]?.trim() ||
      String(s.regionName || "").split(" и ")[0]?.trim() ||
      "";
    features.push({
      type: "Feature",
      id: features.length + 1,
      geometry: { type: "Point", coordinates: [lon, lat] },
      properties: {
        Type: "Винный супермаркет",
        Title: "Ароматный Мир",
        City: city,
        Adress: s.address || "",
        Product: PRODUCT,
        Packing: "",
        SourceId: String(s.id),
        SourceUrl: s.url ? `https://amwine.ru${s.url}` : "",
        RegionCode: s.regionCode || "",
        RegionName: s.regionName || "",
      },
    });
  }
  return features;
}

async function main() {
  if (!fs.existsSync(CHROME)) {
    console.error("Chrome not found:", CHROME);
    process.exit(1);
  }

  const profile = path.join(root, "tmp/amwine-chrome-profile");
  fs.mkdirSync(profile, { recursive: true });
  fs.mkdirSync(path.dirname(outGeo), { recursive: true });
  fs.mkdirSync(path.dirname(outRaw), { recursive: true });

  const port = 9222 + Math.floor(Math.random() * 200);
  const chrome = spawn(
    CHROME,
    [
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${profile}`,
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      "about:blank",
    ],
    { stdio: ["ignore", "ignore", "pipe"] },
  );

  try {
    let list;
    for (let i = 0; i < 20; i++) {
      try {
        list = await httpGetJson(`http://127.0.0.1:${port}/json/list`);
        if (list?.length) break;
      } catch {
        // chrome warming up
      }
      await sleep(250);
    }
    const page = list?.find((t) => t.type === "page") || list?.[0];
    if (!page?.webSocketDebuggerUrl) {
      throw new Error("No CDP page target");
    }

    const payload = await cdp(page.webSocketDebuggerUrl);
    if (!payload?.ok) {
      throw new Error(payload?.error || "scrape failed");
    }

    const features = toFeatures(payload.shops);
    fs.writeFileSync(
      outRaw,
      JSON.stringify(
        {
          scrapedAt: new Date().toISOString(),
          source: "https://amwine.ru/customers/shops/",
          regionCounts: payload.regionCounts,
          shops: payload.shops.map((s) => ({
            id: s.id,
            xml_id: s.xml_id,
            name: s.name,
            address: s.address,
            lat: s.location?.lat,
            lon: s.location?.lon,
            url: s.url,
            regionCode: s.regionCode,
            regionName: s.regionName,
            active: s.active,
          })),
        },
        null,
        2,
      ),
    );
    fs.writeFileSync(
      outGeo,
      JSON.stringify({ type: "FeatureCollection", features }),
    );
    fs.writeFileSync(
      outMeta,
      JSON.stringify(
        {
          scrapedAt: new Date().toISOString(),
          source: "https://amwine.ru/customers/shops/",
          chainTitle: "АРОМАТНЫЙ МИР",
          featureCount: features.length,
          product: PRODUCT,
          regionCounts: payload.regionCounts,
          errors: payload.errors || [],
          note: "All amwine regions via aero:shops.list getStores; Product from CRM fixture TRUE cells",
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
          regions: Object.fromEntries(
            Object.entries(payload.regionCounts || {}).map(([k, v]) => [
              k,
              v.count,
            ]),
          ),
          errors: payload.errors || [],
          outGeo: path.relative(root, outGeo),
          product: PRODUCT,
        },
        null,
        2,
      ),
    );
  } finally {
    chrome.kill("SIGTERM");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
