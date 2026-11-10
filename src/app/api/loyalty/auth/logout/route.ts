import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/server/db/client";
import {
  MEMBER_SESSION_COOKIE,
  revokeMemberSession,
} from "@/server/loyalty/magic-link";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const store = await cookies();
  const token = store.get(MEMBER_SESSION_COOKIE)?.value ?? null;
  try {
    await revokeMemberSession(getDb(), token);
  } catch (err) {
    console.error(
      "[loyalty/auth/logout]",
      err instanceof Error ? err.message : err,
    );
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: MEMBER_SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
