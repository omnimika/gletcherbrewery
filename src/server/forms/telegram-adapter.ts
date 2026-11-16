/**
 * Live Telegram Bot API adapter for public form leads (B2).
 * Secrets only from env — never log token or full PII.
 */

import type {
  DeliveryAdapter,
  DeliveryAttemptResult,
  DeliveryJobSnapshot,
} from "./delivery-adapters";
import { formatLeadTelegramHtml, type LeadFields } from "./telegram-message";
import {
  parseTelegramRetryAfterMs,
  sendTelegramHtmlMessage,
  TELEGRAM_REQUEST_TIMEOUT_MS,
  type TelegramConfig,
} from "./telegram-send";

export type { TelegramConfig };
export { parseTelegramRetryAfterMs, TELEGRAM_REQUEST_TIMEOUT_MS };

export function readTelegramConfigFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): TelegramConfig | null {
  const botToken = env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = env.TELEGRAM_CHAT_ID?.trim();
  if (!botToken || !chatId) return null;
  const threadId = env.TELEGRAM_THREAD_ID?.trim();
  return { botToken, chatId, ...(threadId ? { threadId } : {}) };
}

type FetchLike = typeof fetch;

export class TelegramDeliveryAdapter implements DeliveryAdapter {
  readonly destination = "telegram" as const;

  constructor(
    private readonly config: TelegramConfig,
    private readonly loadFields: (submissionId: string) => Promise<{
      formId: string;
      sourcePath: string;
      locale: string;
      fields: LeadFields;
    }>,
    private readonly fetchImpl: FetchLike = fetch,
    private readonly timeoutMs: number = TELEGRAM_REQUEST_TIMEOUT_MS,
  ) {}

  async deliver(job: DeliveryJobSnapshot): Promise<DeliveryAttemptResult> {
    const submissionId = job.submissionId ?? job.sourceId;
    let payload: {
      formId: string;
      sourcePath: string;
      locale: string;
      fields: LeadFields;
    };
    try {
      payload = await this.loadFields(submissionId);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "load_failed";
      return {
        outcome: "retryable",
        sanitizedError: `load_fields:${msg.slice(0, 80)}`,
      };
    }

    const text = formatLeadTelegramHtml({
      formId: payload.formId,
      submissionId,
      sourcePath: payload.sourcePath,
      locale: payload.locale,
      fields: payload.fields,
    });

    return sendTelegramHtmlMessage({
      config: this.config,
      text,
      fetchImpl: this.fetchImpl,
      timeoutMs: this.timeoutMs,
    });
  }
}
