import type { AppDb } from "@/server/db/client";
import { deliveryJobs } from "@/server/db/schema";
import { LOYALTY_TELEGRAM_DESTINATION } from "@/server/forms/contracts";

export type LoyaltyNotifySourceKind =
  | "loyalty_receipt"
  | "loyalty_agent_application";

/**
 * Enqueue telegram_agent outbox job in the same transaction as the business row.
 * Idempotent on (source_kind, source_id, destination, event_type, schema_version).
 */
export async function enqueueLoyaltyTelegramJob(
  tx: AppDb,
  input: {
    sourceKind: LoyaltyNotifySourceKind;
    sourceId: string;
    eventType: string;
  },
): Promise<void> {
  await tx
    .insert(deliveryJobs)
    .values({
      submissionId: null,
      sourceKind: input.sourceKind,
      sourceId: input.sourceId,
      destination: LOYALTY_TELEGRAM_DESTINATION,
      eventType: input.eventType,
      schemaVersion: "1",
      status: "pending",
    })
    .onConflictDoNothing({
      target: [
        deliveryJobs.sourceKind,
        deliveryJobs.sourceId,
        deliveryJobs.destination,
        deliveryJobs.eventType,
        deliveryJobs.schemaVersion,
      ],
    });
}
