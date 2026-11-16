import { eq } from "drizzle-orm";
import type { AppDb } from "@/server/db/client";
import { loyaltyLedgerEntries } from "@/server/db/schema";

export type LedgerEntryLike = {
  entryKind: string;
  amount: number;
  status: string;
};

const EARN_KINDS = new Set([
  "check_earn",
  "shop_earn",
  "agent_earn",
  "opening",
  "adjustment",
]);

/**
 * Spendable balance: sum of posted entries.
 * Owner Confirmed: future check earns only after verified receipt
 * (caller posts check_earn only when verified). Pending receipts must not
 * create posted check_earn rows.
 */
export function spendableBalance(entries: LedgerEntryLike[]): number {
  return entries
    .filter((e) => e.status === "posted")
    .reduce((acc, e) => {
      if (e.entryKind === "spend") return acc + e.amount; // amount negative
      if (EARN_KINDS.has(e.entryKind)) return acc + e.amount;
      return acc;
    }, 0);
}

export async function loadMemberLedger(
  db: AppDb,
  memberId: string,
): Promise<LedgerEntryLike[]> {
  return db
    .select({
      entryKind: loyaltyLedgerEntries.entryKind,
      amount: loyaltyLedgerEntries.amount,
      status: loyaltyLedgerEntries.status,
    })
    .from(loyaltyLedgerEntries)
    .where(eq(loyaltyLedgerEntries.memberId, memberId));
}

export async function spendableBalanceForMember(
  db: AppDb,
  memberId: string,
): Promise<number> {
  return spendableBalance(await loadMemberLedger(db, memberId));
}

/** Posted positive earns only (for provisional level UI). */
export function lifetimeEarnBircoins(entries: LedgerEntryLike[]): number {
  return entries
    .filter((e) => e.status === "posted" && EARN_KINDS.has(e.entryKind))
    .reduce((acc, e) => acc + Math.max(0, e.amount), 0);
}

export async function lifetimeEarnForMember(
  db: AppDb,
  memberId: string,
): Promise<number> {
  return lifetimeEarnBircoins(await loadMemberLedger(db, memberId));
}
