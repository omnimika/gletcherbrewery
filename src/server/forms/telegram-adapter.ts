/**
 * Live Telegram Bot API adapter (B2).
 * Secrets only from env — never log token or full PII.
 */

import type { DeliveryAdapter, DeliveryAttemptResult, DeliveryJobSnapshot } from "./delivery-adapters";
import { formatLeadTelegramHtml, type LeadFields } from "./telegram-message";

export type TelegramConfig = {
  botToken: string;
  chatId: string;
  threadId?: string;
};

export const TELEGRAM_REQUEST_TIMEOUT_MS = 15_000;

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

type TelegramApiBody = {
  ok?: boolean;
  result?: { message_id?: number };
  description?: string;
  parameters?: { retry_after?: number };
};

/** Parse Bot API retry_after (seconds) → ms. Falls back to description text. */
export function parseTelegramRetryAfterMs(
  json: TelegramApiBody,
  fallbackMs = 30_000,
): number {
  const fromParams = json.parameters?.retry_after;
  if (typeof fromParams === "number" && Number.isFinite(fromParams) && fromParams > 0) {
    return Math.min(300_000, Math.round(fromParams * 1000));
  }
  const desc = json.description ?? "";
  const match = /retry after (\d+)/i.exec(desc);
  if (match) {
    const sec = Number(match[1]);
    if (Number.isFinite(sec) && sec > 0) {
      return Math.min(300_000, Math.round(sec * 1000));
    }
  }
  return fallbackMs;
}

async function readJsonWithDeadline(
  response: Response,
  deadlineAt: number,
): Promise<TelegramApiBody> {
  const remaining = deadlineAt - Date.now();
  if (remaining <= 0) {
    const err = new Error("telegram_body_timeout");
    err.name = "AbortError";
    throw err;
  }

  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      response.json() as Promise<TelegramApiBody>,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          const err = new Error("telegram_body_timeout");
          err.name = "AbortError";
          reject(err);
        }, remaining);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

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
    let payload: {
      formId: string;
      sourcePath: string;
      locale: string;
      fields: LeadFields;
    };
    try {
      payload = await this.loadFields(job.submissionId);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "load_failed";
      return { outcome: "retryable", sanitizedError: `load_fields:${msg.slice(0, 80)}` };
    }

    const text = formatLeadTelegramHtml({
      formId: payload.formId,
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

    const started = Date.now();
    const deadlineAt = started + this.timeoutMs;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

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
      clearTimeout(timeout);
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
    }

    // R07: deadline covers response body, not only headers.
    let json: TelegramApiBody = {};
    try {
      json = await readJsonWithDeadline(response, deadlineAt);
    } catch (err) {
      clearTimeout(timeout);
      const name = err instanceof Error ? err.name : "error";
      if (name === "AbortError") {
        return {
          outcome: "ambiguous",
          sanitizedError: "telegram_timeout_after_possible_accept",
        };
      }
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
    } finally {
      clearTimeout(timeout);
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
        retryAfterMs: parseTelegramRetryAfterMs(json),
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
