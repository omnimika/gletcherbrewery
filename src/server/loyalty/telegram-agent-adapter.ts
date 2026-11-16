/**
 * Telegram adapter for loyalty cabinet → TELEGRAM_AGENT_CHAT_ID.
 */

import { eq } from "drizzle-orm";
import type { AppDb } from "@/server/db/client";
import {
  loyaltyAgentApplications,
  loyaltyMembers,
  loyaltyReceipts,
} from "@/server/db/schema";
import { LOYALTY_TELEGRAM_DESTINATION } from "@/server/forms/contracts";
import type {
  DeliveryAdapter,
  DeliveryAttemptResult,
  DeliveryJobSnapshot,
} from "@/server/forms/delivery-adapters";
import {
  sendTelegramHtmlMessage,
  TELEGRAM_REQUEST_TIMEOUT_MS,
  type TelegramConfig,
} from "@/server/forms/telegram-send";
import {
  formatAgentApplicationTelegramHtml,
  formatReceiptTelegramHtml,
} from "./telegram-message";

export function readTelegramAgentConfigFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): TelegramConfig | null {
  const botToken = env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = env.TELEGRAM_AGENT_CHAT_ID?.trim();
  if (!botToken || !chatId) return null;
  const threadId = env.TELEGRAM_AGENT_THREAD_ID?.trim();
  return { botToken, chatId, ...(threadId ? { threadId } : {}) };
}

type FetchLike = typeof fetch;

export class TelegramAgentDeliveryAdapter implements DeliveryAdapter {
  readonly destination = LOYALTY_TELEGRAM_DESTINATION;

  constructor(
    private readonly config: TelegramConfig,
    private readonly db: AppDb,
    private readonly fetchImpl: FetchLike = fetch,
    private readonly timeoutMs: number = TELEGRAM_REQUEST_TIMEOUT_MS,
  ) {}

  async deliver(job: DeliveryJobSnapshot): Promise<DeliveryAttemptResult> {
    let text: string;
    try {
      text = await this.buildMessage(job);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "load_failed";
      return {
        outcome: "retryable",
        sanitizedError: `load_loyalty:${msg.slice(0, 80)}`,
      };
    }

    return sendTelegramHtmlMessage({
      config: this.config,
      text,
      fetchImpl: this.fetchImpl,
      timeoutMs: this.timeoutMs,
    });
  }

  private async buildMessage(job: DeliveryJobSnapshot): Promise<string> {
    if (job.sourceKind === "loyalty_receipt") {
      const [row] = await this.db
        .select({
          id: loyaltyReceipts.id,
          status: loyaltyReceipts.status,
          source: loyaltyReceipts.source,
          city: loyaltyReceipts.city,
          venueNetwork: loyaltyReceipts.venueNetwork,
          venueName: loyaltyReceipts.venueName,
          gletcherSumRub: loyaltyReceipts.gletcherSumRub,
          proposedEarn: loyaltyReceipts.proposedEarn,
          purchaseAt: loyaltyReceipts.purchaseAt,
          email: loyaltyMembers.emailNormalized,
          displayName: loyaltyMembers.displayName,
        })
        .from(loyaltyReceipts)
        .innerJoin(
          loyaltyMembers,
          eq(loyaltyMembers.id, loyaltyReceipts.memberId),
        )
        .where(eq(loyaltyReceipts.id, job.sourceId))
        .limit(1);
      if (!row) throw new Error("receipt_not_found");
      return formatReceiptTelegramHtml({
        receiptId: row.id,
        email: row.email,
        displayName: row.displayName,
        city: row.city,
        venue: row.venueNetwork || row.venueName,
        gletcherSumRub: row.gletcherSumRub,
        proposedEarn: row.proposedEarn,
        source: row.source,
        purchaseAt: row.purchaseAt,
      });
    }

    if (job.sourceKind === "loyalty_agent_application") {
      const [row] = await this.db
        .select({
          id: loyaltyAgentApplications.id,
          phone: loyaltyAgentApplications.phone,
          city: loyaltyAgentApplications.city,
          venueName: loyaltyAgentApplications.venueName,
          venueType: loyaltyAgentApplications.venueType,
          venueAddress: loyaltyAgentApplications.venueAddress,
          venueBoss: loyaltyAgentApplications.venueBoss,
          comment: loyaltyAgentApplications.comment,
          email: loyaltyMembers.emailNormalized,
          displayName: loyaltyMembers.displayName,
        })
        .from(loyaltyAgentApplications)
        .innerJoin(
          loyaltyMembers,
          eq(loyaltyMembers.id, loyaltyAgentApplications.memberId),
        )
        .where(eq(loyaltyAgentApplications.id, job.sourceId))
        .limit(1);
      if (!row) throw new Error("agent_application_not_found");
      return formatAgentApplicationTelegramHtml({
        applicationId: row.id,
        email: row.email,
        displayName: row.displayName,
        phone: row.phone,
        city: row.city,
        venueName: row.venueName,
        venueType: row.venueType,
        venueAddress: row.venueAddress,
        venueBoss: row.venueBoss,
        comment: row.comment,
      });
    }

    throw new Error(`unsupported_source_kind:${job.sourceKind}`);
  }
}
