import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { and, eq, gt, isNull } from "drizzle-orm";
import type { AppDb } from "@/server/db/client";
import {
  loyaltyMagicLinkTokens,
  loyaltyMemberSessions,
  loyaltyMembers,
} from "@/server/db/schema";
import { normalizeMemberEmail } from "./normalize-alias";
import { upsertMemberByEmail } from "./members";

export const MEMBER_SESSION_COOKIE = "gletcher_member_session";

const MAGIC_TTL_MS = 20 * 60 * 1000;
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function sha256Hex(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
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

/**
 * R04: treat managed/prod-like hosts as deployment — debug magic-link must stay off.
 * Local `next dev` (NODE_ENV=development, no cloud markers) is not deployment-like.
 */
export function isDeploymentLikeEnvironment(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  if ((env.LOYALTY_FORCE_SECURE_AUTH || "").trim() === "1") return true;
  if ((env.NODE_ENV || "").trim() === "production") return true;
  if ((env.VERCEL || "").trim() === "1") return true;
  if ((env.VERCEL_ENV || "").trim().length > 0) return true;
  if ((env.YANDEX_CLOUD || "").trim().length > 0) return true;
  if ((env.YC_SERVERLESS_FUNCTION || "").trim().length > 0) return true;
  if ((env.K_SERVICE || "").trim().length > 0) return true;
  return false;
}

/**
 * Debug bearer links only when explicitly enabled AND not on a deployment-like host.
 * Fail-closed: production/cloud markers win over LOYALTY_MAGIC_LINK_DEBUG=1.
 */
export function isMagicLinkDebugEnabled(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  if ((env.LOYALTY_MAGIC_LINK_DEBUG || "").trim() !== "1") return false;
  if (isDeploymentLikeEnvironment(env)) return false;
  return true;
}

export function publicSiteOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_ORIGIN?.trim() ||
    process.env.LOYALTY_PUBLIC_ORIGIN?.trim() ||
    "http://127.0.0.1:3000"
  );
}

export async function issueMagicLink(
  db: AppDb,
  input: {
    email: string;
    requestIp?: string | null;
    userAgent?: string | null;
  },
): Promise<
  | { ok: true; emailNormalized: string; verifyUrl: string; expiresAt: Date }
  | { ok: false; code: "invalid_email" }
> {
  const emailNormalized = normalizeMemberEmail(input.email);
  if (!emailNormalized.includes("@")) {
    return { ok: false, code: "invalid_email" };
  }

  const rawToken = randomBytes(32).toString("base64url");
  const tokenHash = sha256Hex(rawToken);
  const expiresAt = new Date(Date.now() + MAGIC_TTL_MS);

  await db.insert(loyaltyMagicLinkTokens).values({
    emailNormalized,
    tokenHash,
    expiresAt,
    requestIp: input.requestIp ?? null,
    userAgent: input.userAgent ?? null,
  });

  const verifyUrl = `${publicSiteOrigin()}/agent/auth/verify?token=${encodeURIComponent(rawToken)}`;
  return { ok: true, emailNormalized, verifyUrl, expiresAt };
}

export type ConsumeMagicLinkResult =
  | {
      ok: true;
      member: typeof loyaltyMembers.$inferSelect;
      sessionToken: string;
      expiresAt: Date;
    }
  | { ok: false; code: "invalid_token" | "expired" | "consumed" };

/** Test seam: throw here to prove token consume rolls back with the transaction. */
export type ConsumeMagicLinkOptions = {
  beforeSessionInsert?: (tx: AppDb) => Promise<void>;
};

/**
 * R03: unused→used + member upsert/onboarding + session in one transaction.
 * Concurrent use of the same token yields a single session.
 */
export async function consumeMagicLink(
  db: AppDb,
  rawToken: string,
  options?: ConsumeMagicLinkOptions,
): Promise<ConsumeMagicLinkResult> {
  const token = rawToken.trim();
  if (!token || token.length < 20) {
    return { ok: false, code: "invalid_token" };
  }
  const tokenHash = sha256Hex(token);
  const now = new Date();

  return db.transaction(async (tx) => {
    const claimed = await tx
      .update(loyaltyMagicLinkTokens)
      .set({ consumedAt: now })
      .where(
        and(
          eq(loyaltyMagicLinkTokens.tokenHash, tokenHash),
          isNull(loyaltyMagicLinkTokens.consumedAt),
          gt(loyaltyMagicLinkTokens.expiresAt, now),
        ),
      )
      .returning();

    if (!claimed[0]) {
      const existing = await tx
        .select()
        .from(loyaltyMagicLinkTokens)
        .where(eq(loyaltyMagicLinkTokens.tokenHash, tokenHash))
        .limit(1);
      const row = existing[0];
      if (!row) return { ok: false, code: "invalid_token" };
      if (row.consumedAt) return { ok: false, code: "consumed" };
      if (row.expiresAt.getTime() < now.getTime()) {
        return { ok: false, code: "expired" };
      }
      return { ok: false, code: "invalid_token" };
    }

    const row = claimed[0];
    let member = await upsertMemberByEmail(tx, {
      email: row.emailNormalized,
    });

    if (!member.onboardedAt) {
      const onboarded = await tx
        .update(loyaltyMembers)
        .set({ onboardedAt: now, updatedAt: now })
        .where(eq(loyaltyMembers.id, member.id))
        .returning();
      if (onboarded[0]) member = onboarded[0];
    }

    if (options?.beforeSessionInsert) {
      await options.beforeSessionInsert(tx);
    }

    const sessionToken = randomBytes(32).toString("base64url");
    const sessionHash = sha256Hex(sessionToken);
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

    await tx.insert(loyaltyMemberSessions).values({
      memberId: member.id,
      sessionHash,
      expiresAt,
      lastSeenAt: now,
    });

    return { ok: true, member, sessionToken, expiresAt };
  });
}

export async function resolveMemberSession(
  db: AppDb,
  sessionToken: string | null | undefined,
): Promise<typeof loyaltyMembers.$inferSelect | null> {
  if (!sessionToken?.trim()) return null;
  const sessionHash = sha256Hex(sessionToken.trim());
  const now = new Date();
  const rows = await db
    .select({
      member: loyaltyMembers,
      sessionId: loyaltyMemberSessions.id,
    })
    .from(loyaltyMemberSessions)
    .innerJoin(
      loyaltyMembers,
      eq(loyaltyMemberSessions.memberId, loyaltyMembers.id),
    )
    .where(
      and(
        eq(loyaltyMemberSessions.sessionHash, sessionHash),
        isNull(loyaltyMemberSessions.revokedAt),
        gt(loyaltyMemberSessions.expiresAt, now),
      ),
    )
    .limit(1);
  const hit = rows[0];
  if (!hit) return null;
  await db
    .update(loyaltyMemberSessions)
    .set({ lastSeenAt: now })
    .where(eq(loyaltyMemberSessions.id, hit.sessionId));
  return hit.member;
}

export async function revokeMemberSession(
  db: AppDb,
  sessionToken: string | null | undefined,
): Promise<void> {
  if (!sessionToken?.trim()) return;
  const sessionHash = sha256Hex(sessionToken.trim());
  await db
    .update(loyaltyMemberSessions)
    .set({ revokedAt: new Date() })
    .where(eq(loyaltyMemberSessions.sessionHash, sessionHash));
}

/** Test helper — not used in prod paths. */
export function _hashForTests(value: string): string {
  return sha256Hex(value);
}

export function _safeEqualForTests(a: string, b: string): boolean {
  return safeEqualHex(a, b);
}
