import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { and, eq, gt, isNull, sql } from "drizzle-orm";
import type { AppDb } from "@/server/db/client";
import { staffSessions, staffUsers } from "@/server/db/schema";
import { isStaffRole, type StaffRole } from "./roles";

const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

export type StaffSessionActor = {
  /** Audit label — normalized email. */
  id: string;
  userId: string;
  email: string;
  role: StaffRole;
  sessionId: string;
};

export function hashStaffSessionToken(raw: string): string {
  return createHash("sha256").update(raw, "utf8").digest("hex");
}

function safeEqualHex(a: string, b: string): boolean {
  try {
    const ba = Buffer.from(a, "hex");
    const bb = Buffer.from(b, "hex");
    if (ba.length !== bb.length) return false;
    return timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}

export function normalizeStaffEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function createStaffSession(
  db: AppDb,
  input: { email: string },
): Promise<
  | { ok: true; rawToken: string; actor: StaffSessionActor; expiresAt: Date }
  | { ok: false; code: "unknown_user" | "inactive" | "invalid_role" }
> {
  const email = normalizeStaffEmail(input.email);
  if (!email.includes("@")) {
    return { ok: false, code: "unknown_user" };
  }

  const rows = await db
    .select()
    .from(staffUsers)
    .where(sql`lower(${staffUsers.email}) = ${email}`)
    .limit(1);
  const user = rows[0];
  if (!user) return { ok: false, code: "unknown_user" };
  if (!user.active) return { ok: false, code: "inactive" };
  if (!isStaffRole(user.role)) return { ok: false, code: "invalid_role" };

  const rawToken = randomBytes(32).toString("base64url");
  const tokenHash = hashStaffSessionToken(rawToken);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  const inserted = await db
    .insert(staffSessions)
    .values({
      userId: user.id,
      tokenHash,
      expiresAt,
      lastSeenAt: new Date(),
    })
    .returning({ id: staffSessions.id });

  const sessionId = inserted[0]?.id;
  if (!sessionId) return { ok: false, code: "unknown_user" };

  return {
    ok: true,
    rawToken,
    expiresAt,
    actor: {
      id: email,
      userId: user.id,
      email,
      role: user.role,
      sessionId,
    },
  };
}

export async function resolveStaffSession(
  db: AppDb,
  rawToken: string | null | undefined,
): Promise<StaffSessionActor | null> {
  if (!rawToken || rawToken.length < 16) return null;
  const tokenHash = hashStaffSessionToken(rawToken);
  const now = new Date();

  const rows = await db
    .select({
      sessionId: staffSessions.id,
      userId: staffUsers.id,
      email: staffUsers.email,
      role: staffUsers.role,
      active: staffUsers.active,
      tokenHash: staffSessions.tokenHash,
      expiresAt: staffSessions.expiresAt,
      revokedAt: staffSessions.revokedAt,
    })
    .from(staffSessions)
    .innerJoin(staffUsers, eq(staffSessions.userId, staffUsers.id))
    .where(
      and(
        eq(staffSessions.tokenHash, tokenHash),
        isNull(staffSessions.revokedAt),
        gt(staffSessions.expiresAt, now),
      ),
    )
    .limit(1);

  const row = rows[0];
  if (!row || !row.active) return null;
  if (!safeEqualHex(row.tokenHash, tokenHash)) return null;
  if (!isStaffRole(row.role)) return null;

  const email = normalizeStaffEmail(row.email);
  await db
    .update(staffSessions)
    .set({ lastSeenAt: now })
    .where(eq(staffSessions.id, row.sessionId));

  return {
    id: email,
    userId: row.userId,
    email,
    role: row.role,
    sessionId: row.sessionId,
  };
}

export async function revokeStaffSession(
  db: AppDb,
  rawToken: string | null | undefined,
): Promise<void> {
  if (!rawToken) return;
  const tokenHash = hashStaffSessionToken(rawToken);
  await db
    .update(staffSessions)
    .set({ revokedAt: new Date() })
    .where(
      and(eq(staffSessions.tokenHash, tokenHash), isNull(staffSessions.revokedAt)),
    );
}

/** Upsert allowlist row (seed). Email stored lowercased. */
export async function upsertStaffUser(
  db: AppDb,
  input: {
    email: string;
    role: StaffRole;
    displayName?: string | null;
    active?: boolean;
  },
): Promise<{ id: string; email: string; role: StaffRole }> {
  const email = normalizeStaffEmail(input.email);
  const existing = await db
    .select()
    .from(staffUsers)
    .where(sql`lower(${staffUsers.email}) = ${email}`)
    .limit(1);

  if (existing[0]) {
    await db
      .update(staffUsers)
      .set({
        role: input.role,
        displayName: input.displayName ?? existing[0].displayName,
        active: input.active ?? true,
        updatedAt: new Date(),
        email,
      })
      .where(eq(staffUsers.id, existing[0].id));
    return { id: existing[0].id, email, role: input.role };
  }

  const inserted = await db
    .insert(staffUsers)
    .values({
      email,
      role: input.role,
      displayName: input.displayName ?? null,
      active: input.active ?? true,
    })
    .returning({ id: staffUsers.id });

  return { id: inserted[0]!.id, email, role: input.role };
}
