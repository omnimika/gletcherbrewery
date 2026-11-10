import { NextResponse } from "next/server";
import { getDb } from "@/server/db/client";
import {
  MEMBER_SESSION_COOKIE,
  consumeMagicLink,
} from "@/server/loyalty/magic-link";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Prefer Host / nextUrl so we never redirect to 0.0.0.0 from `next dev --hostname 0.0.0.0`. */
function requestOrigin(request: Request): string {
  const host =
    request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
    request.headers.get("host")?.trim();
  if (host && !host.startsWith("0.0.0.0")) {
    const proto =
      request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
      (host.includes("localhost") || host.startsWith("127.")
        ? "http"
        : "https");
    return `${proto}://${host}`;
  }
  try {
    const u = new URL(request.url);
    if (u.hostname && u.hostname !== "0.0.0.0") {
      return u.origin;
    }
  } catch {
    /* ignore */
  }
  return "http://127.0.0.1:3000";
}

function cabinetUrl(request: Request): URL {
  return new URL("/agent/cabinet", requestOrigin(request));
}

function loginErrorUrl(request: Request, code: string): URL {
  const url = new URL("/agent/login", requestOrigin(request));
  url.searchParams.set("error", code);
  return url;
}

async function exchangeToken(request: Request, token: string) {
  try {
    const result = await consumeMagicLink(getDb(), token);
    if (!result.ok) {
      return NextResponse.redirect(loginErrorUrl(request, result.code), 303);
    }

    const res = NextResponse.redirect(cabinetUrl(request), 303);
    res.cookies.set({
      name: MEMBER_SESSION_COOKIE,
      value: result.sessionToken,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
      expires: result.expiresAt,
    });
    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("[loyalty/auth/verify]", message);
    return NextResponse.redirect(loginErrorUrl(request, "db_error"), 303);
  }
}

/**
 * Preferred path: open link in browser → set session cookie → cabinet.
 * No client JS required (fixes localhost vs 127.0.0.1 hydration stalls).
 */
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  if (!token.trim()) {
    return NextResponse.redirect(loginErrorUrl(request, "invalid_token"), 303);
  }
  return exchangeToken(request, token);
}

/** JSON exchange (optional; used by client fallback). */
export async function POST(request: Request) {
  let token = "";
  try {
    const body = (await request.json()) as { token?: unknown };
    token = String(body.token ?? "");
  } catch {
    return NextResponse.json(
      { ok: false, code: "invalid_body" },
      { status: 400 },
    );
  }

  try {
    const result = await consumeMagicLink(getDb(), token);
    if (!result.ok) {
      const status = result.code === "expired" ? 410 : 400;
      return NextResponse.json(
        { ok: false, code: result.code },
        { status },
      );
    }

    const res = NextResponse.json({
      ok: true,
      member: {
        id: result.member.id,
        email: result.member.emailNormalized,
        displayName: result.member.displayName,
      },
    });
    res.cookies.set({
      name: MEMBER_SESSION_COOKIE,
      value: result.sessionToken,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
      expires: result.expiresAt,
    });
    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("[loyalty/auth/verify]", message);
    return NextResponse.json(
      { ok: false, code: "db_error" },
      { status: 503 },
    );
  }
}
