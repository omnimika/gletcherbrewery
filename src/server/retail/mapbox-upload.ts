/**
 * Mapbox tileset Product republish from staged GeoJSON.
 * MTS tilesets: replace tileset-source → publish.
 * Studio tilesets: Uploads API → replace named tileset.
 *
 * Requires MAPBOX_ALLOW_TILESET_PUBLISH=true and sk token. Never log tokens.
 */

import fs from "node:fs";
import path from "node:path";
import {
  MAPBOX_STYLE_ID,
  MAPBOX_STYLE_OWNER,
  RETAIL_TILESETS,
  type RetailTilesetRef,
} from "@/server/retail/mapbox-tilesets";

export type LayerUploadResult = {
  layerId: string;
  tilesetId: string;
  kind: "mts" | "studio";
  ok: boolean;
  step: string;
  detail?: Record<string, unknown>;
  error?: string;
};

function token(): string {
  const t = process.env.MAPBOX_SECRET_TOKEN || process.env.MAPBOX_TOKEN;
  if (!t || !t.startsWith("sk.")) {
    throw new Error("MAPBOX_SECRET_TOKEN / MAPBOX_TOKEN (sk.…) required");
  }
  return t;
}

function username(): string {
  return process.env.MAPBOX_USERNAME?.trim() || MAPBOX_STYLE_OWNER;
}

function assertLiveAllowed(): void {
  if (process.env.MAPBOX_ALLOW_TILESET_PUBLISH !== "true") {
    throw new Error("MAPBOX_ALLOW_TILESET_PUBLISH must be true for live upload");
  }
}

/** FeatureCollection → newline-delimited GeoJSON (Mapbox tileset-source). */
export function featureCollectionToLdGeoJson(fc: {
  features: Array<Record<string, unknown>>;
}): string {
  return fc.features.map((f) => JSON.stringify(f)).join("\n") + "\n";
}

async function mapboxJson(
  url: string,
  init?: RequestInit,
): Promise<{ status: number; body: unknown }> {
  const res = await fetch(url, init);
  const text = await res.text();
  let body: unknown = text;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text.slice(0, 500);
  }
  return { status: res.status, body };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function replaceMtsSource(
  ref: RetailTilesetRef,
  ldGeoJson: string,
  sk: string,
  user: string,
): Promise<{ ok: boolean; error?: string; detail?: Record<string, unknown> }> {
  if (!ref.tilesetSourceId) {
    return { ok: false, error: "missing tilesetSourceId for MTS layer" };
  }
  const sourceUrl = `https://api.mapbox.com/tilesets/v1/sources/${user}/${ref.tilesetSourceId}?access_token=${encodeURIComponent(sk)}`;

  // Prefer new source id + recipe update when delete is locked (HTTP 409).
  let sourceId = ref.tilesetSourceId;
  let usedFreshSource = false;

  let del = await mapboxJson(sourceUrl, { method: "DELETE" });
  for (let attempt = 0; attempt < 5 && del.status === 409; attempt += 1) {
    await sleep(8_000 * (attempt + 1));
    del = await mapboxJson(sourceUrl, { method: "DELETE" });
  }

  if (del.status === 409) {
    sourceId = `gletcher-${ref.layerId}-${Date.now().toString(36)}`.slice(0, 32);
    usedFreshSource = true;
  } else if (del.status !== 204 && del.status !== 200 && del.status !== 404) {
    return {
      ok: false,
      error: `delete source failed HTTP ${del.status}`,
      detail: { body: del.body },
    };
  }

  const createUrl = `https://api.mapbox.com/tilesets/v1/sources/${user}/${sourceId}?access_token=${encodeURIComponent(sk)}`;
  const form = new FormData();
  form.append(
    "file",
    new Blob([ldGeoJson], { type: "application/x-ndjson" }),
    `${ref.layerId}.geojson.ld`,
  );

  let created = await mapboxJson(createUrl, { method: "POST", body: form });
  for (let attempt = 0; attempt < 4 && created.status === 429; attempt += 1) {
    await sleep(15_000 * (attempt + 1));
    created = await mapboxJson(createUrl, { method: "POST", body: form });
  }
  if (created.status !== 200 && created.status !== 201) {
    return {
      ok: false,
      error: `create source failed HTTP ${created.status}`,
      detail: { body: created.body, sourceId },
    };
  }

  if (usedFreshSource) {
    const recipeUrl = `https://api.mapbox.com/tilesets/v1/${ref.tilesetId}/recipe?access_token=${encodeURIComponent(sk)}`;
    const recipeGet = await mapboxJson(recipeUrl);
    if (recipeGet.status !== 200 || !recipeGet.body || typeof recipeGet.body !== "object") {
      return {
        ok: false,
        error: `recipe get failed HTTP ${recipeGet.status}`,
        detail: { body: recipeGet.body },
      };
    }
    const wrapper = recipeGet.body as {
      recipe?: {
        version: number;
        layers: Record<string, { source: string; minzoom?: number; maxzoom?: number; features?: unknown }>;
      };
    };
    const recipe = wrapper.recipe;
    if (!recipe?.layers?.[ref.sourceLayer]) {
      return {
        ok: false,
        error: `recipe missing layer ${ref.sourceLayer}`,
        detail: { recipe },
      };
    }
    recipe.layers[ref.sourceLayer] = {
      ...recipe.layers[ref.sourceLayer],
      source: `mapbox://tileset-source/${user}/${sourceId}`,
    };
    // Mapbox may return 204 No Content on successful recipe PATCH.
    const recipePut = await mapboxJson(recipeUrl, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(recipe),
    });
    const recipeOk =
      recipePut.status === 200 ||
      recipePut.status === 201 ||
      recipePut.status === 204;
    if (!recipeOk) {
      const recipePut2 = await mapboxJson(recipeUrl, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ recipe }),
      });
      const putOk =
        recipePut2.status === 200 ||
        recipePut2.status === 201 ||
        recipePut2.status === 204;
      if (!putOk) {
        return {
          ok: false,
          error: `recipe update failed HTTP ${recipePut.status}/${recipePut2.status}`,
          detail: { patch: recipePut.body, put: recipePut2.body },
        };
      }
    }
  }

  const publishUrl = `https://api.mapbox.com/tilesets/v1/${ref.tilesetId}/publish?access_token=${encodeURIComponent(sk)}`;
  let pub = await mapboxJson(publishUrl, { method: "POST" });
  for (let attempt = 0; attempt < 5 && pub.status === 429; attempt += 1) {
    await sleep(20_000 * (attempt + 1));
    pub = await mapboxJson(publishUrl, { method: "POST" });
  }
  if (pub.status !== 200 && pub.status !== 201) {
    return {
      ok: false,
      error: `publish failed HTTP ${pub.status}`,
      detail: { body: pub.body, sourceId, usedFreshSource },
    };
  }

  // Give Mapbox a moment before the next layer's source delete.
  await sleep(5_000);

  return {
    ok: true,
    detail: {
      sourceId,
      usedFreshSource,
      source: created.body,
      publish: pub.body,
    },
  };
}

async function replaceStudioTileset(
  ref: RetailTilesetRef,
  featureCollectionJson: string,
  sk: string,
  user: string,
): Promise<{ ok: boolean; error?: string; detail?: Record<string, unknown> }> {
  // Stage 1: temporary S3 credentials
  const credUrl = `https://api.mapbox.com/uploads/v1/${user}/credentials?access_token=${encodeURIComponent(sk)}`;
  const cred = await mapboxJson(credUrl, { method: "POST" });
  if (cred.status !== 200 || !cred.body || typeof cred.body !== "object") {
    return {
      ok: false,
      error: `upload credentials HTTP ${cred.status}`,
      detail: { body: cred.body },
    };
  }
  const c = cred.body as {
    accessKeyId: string;
    bucket: string;
    key: string;
    secretAccessKey: string;
    sessionToken: string;
    url: string;
  };

  // Stage 2: PUT GeoJSON FeatureCollection to the pre-signed bucket URL pattern.
  // Mapbox returns an S3 URL; use AWS Signature V4 via fetch to c.url is not enough
  // without signing. Prefer the Mapbox-recommended @mapbox/mapbox-sdk path, or
  // multipart via uploads when available.
  //
  // Practical approach without AWS SDK: use the Mapbox Tilesets "uploads" with
  // a data URI is not supported. We use the S3 PUT with AWS4 from aws4fetch-less
  // manual headers — too fragile. Instead use Mapbox's newer endpoint that accepts
  // multipart for Studio replacements when tileset was created in Studio:
  // fall back to creating an MTS-style temporary source + user must migrate —
  // OR use @aws-sdk/client-s3.
  //
  // Use fetch PUT to `https://{bucket}.s3.amazonaws.com/{key}` with AWS Sig V4.
  // Minimal SigV4 implementation for this single PUT:

  const put = await s3PutObject({
    accessKeyId: c.accessKeyId,
    secretAccessKey: c.secretAccessKey,
    sessionToken: c.sessionToken,
    bucket: c.bucket,
    key: c.key,
    body: featureCollectionJson,
    contentType: "application/json",
    region: "us-east-1",
  });
  if (!put.ok) {
    return { ok: false, error: put.error, detail: put.detail };
  }

  const uploadUrl = `https://api.mapbox.com/uploads/v1/${user}?access_token=${encodeURIComponent(sk)}`;
  const upload = await mapboxJson(uploadUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      url: c.url,
      tileset: ref.tilesetId,
      name: ref.layerId,
    }),
  });
  if (upload.status !== 201 && upload.status !== 200) {
    return {
      ok: false,
      error: `create upload HTTP ${upload.status}`,
      detail: { body: upload.body },
    };
  }

  return { ok: true, detail: { upload: upload.body } };
}

/** Minimal AWS SigV4 S3 PutObject for Mapbox upload staging. */
async function s3PutObject(input: {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
  bucket: string;
  key: string;
  body: string;
  contentType: string;
  region: string;
}): Promise<{ ok: boolean; error?: string; detail?: Record<string, unknown> }> {
  const amzDate = new Date()
    .toISOString()
    .replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const host = `${input.bucket}.s3.${input.region}.amazonaws.com`;
  const canonicalUri = `/${input.key.split("/").map(encodeURIComponent).join("/")}`;
  const payloadHash = await sha256Hex(input.body);
  const canonicalHeaders =
    `content-type:${input.contentType}\n` +
    `host:${host}\n` +
    `x-amz-content-sha256:${payloadHash}\n` +
    `x-amz-date:${amzDate}\n` +
    `x-amz-security-token:${input.sessionToken}\n`;
  const signedHeaders =
    "content-type;host;x-amz-content-sha256;x-amz-date;x-amz-security-token";
  const canonicalRequest = [
    "PUT",
    canonicalUri,
    "",
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");
  const credentialScope = `${dateStamp}/${input.region}/s3/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    await sha256Hex(canonicalRequest),
  ].join("\n");
  const signingKey = await awsSigningKey(
    input.secretAccessKey,
    dateStamp,
    input.region,
    "s3",
  );
  const signature = await hmacHex(signingKey, stringToSign);
  const authorization =
    `AWS4-HMAC-SHA256 Credential=${input.accessKeyId}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const url = `https://${host}${canonicalUri}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "content-type": input.contentType,
      host,
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": amzDate,
      "x-amz-security-token": input.sessionToken,
      authorization,
    },
    body: input.body,
  });
  if (!res.ok) {
    return {
      ok: false,
      error: `S3 PUT HTTP ${res.status}`,
      detail: { body: (await res.text()).slice(0, 400) },
    };
  }
  return { ok: true };
}

async function sha256Hex(message: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(message),
  );
  return [...new Uint8Array(buf)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmac(
  key: ArrayBuffer | Uint8Array,
  message: string,
): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key as BufferSource,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(message));
}

async function hmacHex(
  key: ArrayBuffer | Uint8Array,
  message: string,
): Promise<string> {
  const buf = await hmac(key, message);
  return [...new Uint8Array(buf)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function awsSigningKey(
  secret: string,
  dateStamp: string,
  region: string,
  service: string,
): Promise<ArrayBuffer> {
  const kDate = await hmac(
    new TextEncoder().encode(`AWS4${secret}`),
    dateStamp,
  );
  const kRegion = await hmac(kDate, region);
  const kService = await hmac(kRegion, service);
  return hmac(kService, "aws4_request");
}

export async function uploadStagedLayer(input: {
  ref: RetailTilesetRef;
  stagedGeoJsonPath: string;
}): Promise<LayerUploadResult> {
  assertLiveAllowed();
  const sk = token();
  const user = username();
  const raw = fs.readFileSync(input.stagedGeoJsonPath, "utf8");
  const fc = JSON.parse(raw) as { features: Array<Record<string, unknown>> };

  if (input.ref.kind === "mts") {
    const ld = featureCollectionToLdGeoJson(fc);
    const result = await replaceMtsSource(input.ref, ld, sk, user);
    return {
      layerId: input.ref.layerId,
      tilesetId: input.ref.tilesetId,
      kind: "mts",
      ok: result.ok,
      step: result.ok ? "published" : "mts_replace",
      detail: result.detail,
      error: result.error,
    };
  }

  const result = await replaceStudioTileset(input.ref, raw, sk, user);
  return {
    layerId: input.ref.layerId,
    tilesetId: input.ref.tilesetId,
    kind: "studio",
    ok: result.ok,
    step: result.ok ? "upload_started" : "studio_upload",
    detail: result.detail,
    error: result.error,
  };
}

/**
 * Studio replace sometimes rewrites style `source-layer` to a generated name
 * (e.g. Yarchefinal-2d64rg). Re-assert registry values after uploads.
 */
async function syncStyleSourceLayers(
  refs: readonly RetailTilesetRef[],
  sk: string,
): Promise<{ ok: boolean; patched: string[]; error?: string }> {
  const styleUrl = `https://api.mapbox.com/styles/v1/${MAPBOX_STYLE_ID}?access_token=${encodeURIComponent(sk)}`;
  const get = await mapboxJson(styleUrl);
  if (get.status !== 200 || !get.body || typeof get.body !== "object") {
    return { ok: false, patched: [], error: `style get HTTP ${get.status}` };
  }
  const style = get.body as {
    version?: number;
    layers?: Array<Record<string, unknown>>;
    sources?: Record<string, unknown>;
  };
  const layers = Array.isArray(style.layers) ? style.layers : [];
  const byId = new Map(refs.map((r) => [r.layerId, r] as const));
  const patched: string[] = [];
  for (const layer of layers) {
    const id = String(layer.id ?? "");
    const ref = byId.get(id as RetailTilesetRef["layerId"]);
    if (!ref) continue;
    if (layer["source-layer"] === ref.sourceLayer) continue;
    layer["source-layer"] = ref.sourceLayer;
    patched.push(id);
  }
  if (patched.length === 0) return { ok: true, patched };
  const put = await mapboxJson(styleUrl, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      version: style.version ?? 8,
      layers,
      sources: style.sources,
    }),
  });
  if (put.status !== 200 && put.status !== 201) {
    return {
      ok: false,
      patched,
      error: `style patch HTTP ${put.status}`,
    };
  }
  return { ok: true, patched };
}

export async function uploadAllStagedLayers(input: {
  stagedDir: string;
  onlyLayerIds?: string[];
}): Promise<LayerUploadResult[]> {
  assertLiveAllowed();
  const results: LayerUploadResult[] = [];
  const uploadedRefs: RetailTilesetRef[] = [];
  for (const ref of RETAIL_TILESETS) {
    if (
      input.onlyLayerIds &&
      !input.onlyLayerIds.includes(ref.layerId)
    ) {
      continue;
    }
    const stagedPath = path.join(input.stagedDir, `${ref.layerId}.geojson`);
    if (!fs.existsSync(stagedPath)) {
      results.push({
        layerId: ref.layerId,
        tilesetId: ref.tilesetId,
        kind: ref.kind,
        ok: false,
        step: "missing_staged",
        error: `missing ${stagedPath}`,
      });
      continue;
    }
    try {
      const result = await uploadStagedLayer({
        ref,
        stagedGeoJsonPath: stagedPath,
      });
      results.push(result);
      if (result.ok) uploadedRefs.push(ref);
    } catch (err) {
      results.push({
        layerId: ref.layerId,
        tilesetId: ref.tilesetId,
        kind: ref.kind,
        ok: false,
        step: "exception",
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  if (uploadedRefs.some((r) => r.kind === "studio")) {
    try {
      const sync = await syncStyleSourceLayers(RETAIL_TILESETS, token());
      if (!sync.ok || sync.patched.length > 0) {
        results.push({
          layerId: "__style_sync__",
          tilesetId: MAPBOX_STYLE_ID,
          kind: "studio",
          ok: sync.ok,
          step: "style_source_layer_sync",
          detail: { patched: sync.patched },
          error: sync.error,
        });
      }
    } catch (err) {
      results.push({
        layerId: "__style_sync__",
        tilesetId: MAPBOX_STYLE_ID,
        kind: "studio",
        ok: false,
        step: "style_source_layer_sync",
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return results;
}
