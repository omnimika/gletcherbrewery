import { NextResponse } from "next/server";
import {
  isStaffAuthConfigured,
  STAFF_COOKIE_NAME,
  staffMisconfiguredResponse,
  verifyStaffToken,
} from "@/server/staff/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Exchange STAFF_API_TOKEN for an httpOnly session cookie (local staff UI). */
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

  const token =
    body && typeof body === "object" && "token" in body
      ? String((body as { token?: unknown }).token ?? "")
      : "";

  if (!verifyStaffToken(token)) {
    return NextResponse.json(
      { ok: false, code: "unauthorized", message: "Invalid token" },
      { status: 401 },
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: STAFF_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return res;
}

export async function DELETE() {
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
