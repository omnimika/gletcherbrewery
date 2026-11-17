import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/server/db/client";
import {
  isStaffAuthConfigured,
  STAFF_COOKIE_NAME,
  staffMisconfiguredResponse,
  verifyStaffBootstrapToken,
} from "@/server/staff/auth";
import {
  createStaffSession,
  revokeStaffSession,
} from "@/server/staff/sessions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Login: email (allowlist) + STAFF_API_TOKEN bootstrap → opaque session cookie.
 */
export async function POST(request: Request) {
  if (!isStaffAuthConfigured()) {
    return staffMisconfiguredResponse();
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, code: "invalid_json", message: "Malformed JSON" },
      { status: 400 },
    );
  }

  const email =
    body && typeof body === "object" && "email" in body
      ? String((body as { email?: unknown }).email ?? "")
      : "";
  const token =
    body && typeof body === "object" && "token" in body
      ? String((body as { token?: unknown }).token ?? "")
      : "";

  if (!verifyStaffBootstrapToken(token)) {
    return NextResponse.json(
      { ok: false, code: "unauthorized", message: "Invalid token" },
      { status: 401 },
    );
  }

  const created = await createStaffSession(getDb(), { email });
  if (!created.ok) {
    const message =
      created.code === "inactive"
        ? "Staff user inactive"
        : created.code === "invalid_role"
          ? "Staff user role invalid"
          : "Unknown staff email";
    return NextResponse.json(
      { ok: false, code: created.code, message },
      { status: 401 },
    );
  }

  const res = NextResponse.json({
    ok: true,
    email: created.actor.email,
    role: created.actor.role,
  });
  res.cookies.set({
    name: STAFF_COOKIE_NAME,
    value: created.rawToken,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return res;
}

export async function DELETE() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(STAFF_COOKIE_NAME)?.value ?? null;
  try {
    await revokeStaffSession(getDb(), raw);
  } catch {
    /* still clear cookie */
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: STAFF_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}
