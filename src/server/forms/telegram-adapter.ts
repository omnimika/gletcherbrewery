/**
 * Live Telegram Bot API adapter (B2).
 * Secrets only from env — never log token or full PII.
 */

import type { DeliveryAdapter, DeliveryAttemptResult, DeliveryJobSnapshot } from "./delivery-adapters";
import { formatContactsTelegramHtml, type ContactLeadFields } from "./telegram-message";

export type TelegramConfig = {
  botToken: string;
  chatId: string;
  threadId?: string;
};

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
      sourcePath: string;
      locale: string;
      fields: ContactLeadFields;
    }>,
    private readonly fetchImpl: FetchLike = fetch,
  ) {}

  async deliver(job: DeliveryJobSnapshot): Promise<DeliveryAttemptResult> {
    let payload: {
      sourcePath: string;
      locale: string;
      fields: ContactLeadFields;
    };
    try {
      payload = await this.loadFields(job.submissionId);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "load_failed";
      return { outcome: "retryable", sanitizedError: `load_fields:${msg.slice(0, 80)}` };
    }

    const text = formatContactsTelegramHtml({
      submissionId: job.submissionId,
      sourcePath: payload.sourcePath,
      locale: payload.locale,
      fields: payload.fields,
    });

    const body: Record<string, unknown> = {
      chat_id: this.config.chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    };
    if (this.config.threadId) {
      body.message_thread_id = Number(this.config.threadId);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);

    let response: Response;
    try {
      response = await this.fetchImpl(
        `https://api.telegram.org/bot${this.config.botToken}/sendMessage`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
        },
      );
    } catch (err) {
      const name = err instanceof Error ? err.name : "error";
      if (name === "AbortError") {
        return {
          outcome: "ambiguous",
          sanitizedError: "telegram_timeout_after_possible_accept",
        };
      }
      return {
        outcome: "retryable",
        sanitizedError: `telegram_network:${name}`,
      };
    } finally {
      clearTimeout(timeout);
    }

    let json: { ok?: boolean; result?: { message_id?: number }; description?: string } = {};
    try {
      json = (await response.json()) as typeof json;
    } catch {
      if (response.ok) {
        return {
          outcome: "ambiguous",
          sanitizedError: "telegram_ok_unreadable_body",
        };
      }
      return {
        outcome: "retryable",
        sanitizedError: `telegram_http_${response.status}_bad_json`,
      };
    }

    if (response.ok && json.ok && json.result?.message_id != null) {
      return {
        outcome: "delivered",
        remoteReference: `tg:${this.config.chatId}:${json.result.message_id}`,
      };
    }

    const desc = (json.description ?? "").slice(0, 120);
    if (response.status === 429) {
      return {
        outcome: "retryable",
        sanitizedError: `telegram_429:${desc}`,
        retryAfterMs: 30_000,
      };
    }
    if (response.status >= 500) {
      return {
        outcome: "retryable",
        sanitizedError: `telegram_5xx:${response.status}`,
      };
    }
    // 400 chat not found / bot kicked / bad request — terminal until config fixed
    return {
      outcome: "failed",
      sanitizedError: `telegram_${response.status}:${desc || "rejected"}`,
    };
  }
}
