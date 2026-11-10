import { eq } from "drizzle-orm";
import type { AppDb } from "@/server/db/client";
import { loyaltyMembers } from "@/server/db/schema";
import { normalizeMemberEmail } from "./normalize-alias";

export async function upsertMemberByEmail(
  db: AppDb,
  input: {
    email: string;
    displayName?: string | null;
    phone?: string | null;
    city?: string | null;
    airtableRecordId?: string | null;
  },
) {
  const emailNormalized = normalizeMemberEmail(input.email);
  if (!emailNormalized.includes("@")) {
    throw new Error("invalid_email");
  }

  const existing = await db
    .select()
    .from(loyaltyMembers)
    .where(eq(loyaltyMembers.emailNormalized, emailNormalized))
    .limit(1);
  if (existing[0]) return existing[0];

  const [row] = await db
    .insert(loyaltyMembers)
    .values({
      emailNormalized,
      displayName: input.displayName ?? null,
      phone: input.phone ?? null,
      city: input.city ?? null,
      airtableRecordId: input.airtableRecordId ?? null,
    })
    .returning();
  return row!;
}
