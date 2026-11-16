/**
 * Public API boundary helpers (M2-2): body size + best-effort in-memory rate limits.
 * Limits are justified by existing form/upload contracts — not invented booking rules.
 *
 * Non-prod / single-process: Map resets on restart. Staging may replace with Redis later.
 */

/** Matches `/api/forms/submissions` historical MAX_BYTES. */
export const FORM_JSON_MAX_BYTES = 32_768;

/** Magic-link / tiny auth JSON (email or token only). */
export const AUTH_JSON_MAX_BYTES = 4_096;

/** Agent application JSON fields (phone/city/venue…). */
export const AGENT_APP_JSON_MAX_BYTES = 16_384;

/**
 * Member receipt multipart: photo max 8MB in route + form fields overhead.
 * Content-Length checked before buffering the whole body.
 */
export const RECEIPT_MULTIPART_MAX_BYTES = 9_000_000;

export const RECEIPT_PHOTO_MAX_BYTES = 8_000_000;

export type BoundaryFail = {
  ok: false;
  status: number;
  code: string;
  message: string;
  retryAfterSec?: number;
};

export type BoundaryOk = { ok: true };

export function clientIpFromRequest(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (forwarded) return forwarded.slice(0, 128);
  const real = request.headers.get("x-real-ip")?.trim();
  if (real) return real.slice(0, 128);
  return "unknown";
}

/**
 * Reject oversized bodies early when Content-Length is present.
 * Missing header → allow; caller still enforces after read.
 */
export function enforceContentLength(
  request: Request,
  maxBytes: number,
): BoundaryOk | BoundaryFail {
  const raw = request.headers.get("content-length");
  if (raw == null || raw === "") return { ok: true };
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) {
    return {
      ok: false,
      status: 400,
      code: "invalid_content_length",
      message: "Invalid Content-Length",
    };
  }
  if (n > maxBytes) {
    return {
      ok: false,
      status: 413,
      code: "payload_too_large",
      message: `Request body too large (max ${maxBytes} bytes)`,
    };
  }
  return { ok: true };
}

export async function readJsonBody(
  request: Request,
  maxBytes: number,
): Promise<
  | { ok: true; value: unknown; bytes: number }
  | BoundaryFail
  | { ok: false; status: 400; code: "invalid_json"; message: string }
> {
  const sized = enforceContentLength(request, maxBytes);
  if (!sized.ok) return sized;

  const buf = Buffer.from(await request.arrayBuffer());
  if (buf.byteLength > maxBytes) {
    return {
      ok: false,
      status: 413,
      code: "payload_too_large",
      message: `Request body too large (max ${maxBytes} bytes)`,
    };
  }
  try {
    return {
      ok: true,
      value: JSON.parse(buf.toString("utf8")) as unknown,
      bytes: buf.byteLength,
    };
  } catch {
    return {
      ok: false,
      status: 400,
      code: "invalid_json",
      message: "Malformed JSON",
    };
  }
}

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/** Test helper — clear in-memory counters. */
export function _resetRateLimitBucketsForTests(): void {
  buckets.clear();
}

/**
 * Fixed-window counter. Returns retryAfterSec when limited.
 */
export function checkRateLimit(input: {
  key: string;
  limit: number;
  windowMs: number;
  now?: number;
}): BoundaryOk | BoundaryFail {
  const now = input.now ?? Date.now();
  const existing = buckets.get(input.key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(input.key, { count: 1, resetAt: now + input.windowMs });
    return { ok: true };
  }
  if (existing.count >= input.limit) {
    const retryAfterSec = Math.max(
      1,
      Math.ceil((existing.resetAt - now) / 1000),
    );
    return {
      ok: false,
      status: 429,
      code: "rate_limited",
      message: "Too many requests; try again later",
      retryAfterSec,
    };
  }
  existing.count += 1;
  return { ok: true };
}

/** Forms intake: spam protection without blocking normal multi-form use. */
export const FORM_RATE = { limit: 30, windowMs: 10 * 60_000 } as const;

/** Magic-link request: slow enumeration / mailbox flooding. */
export const MAGIC_LINK_RATE = { limit: 5, windowMs: 15 * 60_000 } as const;

/** Member receipt uploads (photo+OCR heavy). */
export const RECEIPT_UPLOAD_RATE = { limit: 20, windowMs: 10 * 60_000 } as const;

/** Agent applications from authenticated members. */
export const AGENT_APP_RATE = { limit: 10, windowMs: 60 * 60_000 } as const;

export function rateLimitResponse(fail: BoundaryFail): Response {
  const headers = new Headers({ "content-type": "application/json" });
  if (fail.retryAfterSec != null) {
    headers.set("Retry-After", String(fail.retryAfterSec));
  }
  return new Response(
    JSON.stringify({
      ok: false,
      code: fail.code,
      message: fail.message,
    }),
    { status: fail.status, headers },
  );
}

export function boundaryJsonResponse(fail: BoundaryFail): Response {
  return rateLimitResponse(fail);
}
