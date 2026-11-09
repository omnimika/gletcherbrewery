import { createHash, timingSafeEqual } from "node:crypto";

export const STAFF_COOKIE_NAME = "gletcher_staff_session";

function configuredToken(): string | null {
  const raw = process.env.STAFF_API_TOKEN?.trim();
  return raw && raw.length >= 16 ? raw : null;
}

function digest(value: string): Buffer {
  return createHash("sha256").update(value, "utf8").digest();
}

export function isStaffAuthConfigured(): boolean {
  return configuredToken() !== null;
}

/** Compare Bearer / cookie token to STAFF_API_TOKEN (constant-time). */
export function verifyStaffToken(candidate: string | null | undefined): boolean {
  const expected = configuredToken();
  if (!expected || !candidate) return false;
  const a = digest(candidate);
  const b = digest(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function readBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (!header) return null;
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match?.[1]?.trim() || null;
}

export function staffUnauthorizedResponse(message = "Staff auth required") {
  return Response.json(
    { ok: false, code: "unauthorized", message },
    { status: 401 },
  );
}

export function staffMisconfiguredResponse() {
  return Response.json(
    {
      ok: false,
      code: "staff_auth_unconfigured",
      message: "STAFF_API_TOKEN is not set (min 16 chars)",
    },
    { status: 503 },
  );
}
