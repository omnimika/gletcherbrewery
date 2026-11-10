import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/server/db/client";
import {
  MEMBER_SESSION_COOKIE,
  resolveMemberSession,
} from "@/server/loyalty/magic-link";
import { spendableBalanceForMember } from "@/server/loyalty/spendable";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const store = await cookies();
    const token = store.get(MEMBER_SESSION_COOKIE)?.value ?? null;
    const member = await resolveMemberSession(getDb(), token);
    if (!member) {
      return NextResponse.json(
        { ok: false, code: "unauthorized" },
        { status: 401 },
      );
    }
    const balance = await spendableBalanceForMember(getDb(), member.id);
    return NextResponse.json({
      ok: true,
      member: {
        id: member.id,
        email: member.emailNormalized,
        displayName: member.displayName,
        city: member.city,
        onboardedAt: member.onboardedAt,
      },
      spendableBircoins: balance,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("[loyalty/me]", message);
    return NextResponse.json(
      { ok: false, code: "db_error" },
      { status: 503 },
    );
  }
}
