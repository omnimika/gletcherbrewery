import { and, desc, eq } from "drizzle-orm";
import type { AppDb } from "@/server/db/client";
import { loyaltyAgentApplications } from "@/server/db/schema";

export const AGENT_APP_STATUS = {
  underReview: "under_review",
  approved: "approved",
  rejected: "rejected",
} as const;

export type CreateAgentApplicationInput = {
  memberId: string;
  phone: string;
  city: string;
  venueName: string;
  venueType: string;
  venueAddress: string;
  venueBoss?: string | null;
  comment?: string | null;
  legacyOrderId?: string | null;
};

function clean(s: string, max = 200): string {
  return s.trim().replace(/\s+/g, " ").slice(0, max);
}

export async function createAgentApplication(
  db: AppDb,
  input: CreateAgentApplicationInput,
) {
  const phone = clean(input.phone, 40);
  const city = clean(input.city, 80);
  const venueName = clean(input.venueName, 120);
  const venueType = clean(input.venueType, 80);
  const venueAddress = clean(input.venueAddress, 200);
  const venueBoss = input.venueBoss ? clean(input.venueBoss, 120) : null;
  const comment = input.comment ? clean(input.comment, 1000) : null;

  if (!phone || !city || !venueName || !venueType || !venueAddress) {
    throw new Error("invalid_agent_application");
  }

  const [row] = await db
    .insert(loyaltyAgentApplications)
    .values({
      memberId: input.memberId,
      status: AGENT_APP_STATUS.underReview,
      phone,
      city,
      venueName,
      venueType,
      venueAddress,
      venueBoss,
      comment,
      legacyOrderId: input.legacyOrderId ?? null,
    })
    .returning();

  return row!;
}

export async function listAgentApplicationsForMember(
  db: AppDb,
  memberId: string,
  limit = 5,
) {
  return db
    .select({
      id: loyaltyAgentApplications.id,
      status: loyaltyAgentApplications.status,
      venueName: loyaltyAgentApplications.venueName,
      city: loyaltyAgentApplications.city,
      createdAt: loyaltyAgentApplications.createdAt,
    })
    .from(loyaltyAgentApplications)
    .where(eq(loyaltyAgentApplications.memberId, memberId))
    .orderBy(desc(loyaltyAgentApplications.createdAt))
    .limit(limit);
}

export type OpenAgentApplication = {
  id: string;
  status: string;
  venueName: string;
  createdAt: Date;
};

export async function latestOpenAgentApplication(
  db: AppDb,
  memberId: string,
): Promise<OpenAgentApplication | null> {
  const [row] = await db
    .select({
      id: loyaltyAgentApplications.id,
      status: loyaltyAgentApplications.status,
      venueName: loyaltyAgentApplications.venueName,
      createdAt: loyaltyAgentApplications.createdAt,
    })
    .from(loyaltyAgentApplications)
    .where(
      and(
        eq(loyaltyAgentApplications.memberId, memberId),
        eq(loyaltyAgentApplications.status, AGENT_APP_STATUS.underReview),
      ),
    )
    .orderBy(desc(loyaltyAgentApplications.createdAt))
    .limit(1);
  return row ?? null;
}
