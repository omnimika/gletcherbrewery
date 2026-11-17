/**
 * Shared Telegram Bot API sendMessage (HTML). No secrets in return values.
 */

import type { DeliveryAttemptResult } from "./delivery-adapters";

export type TelegramConfig = {
  botToken: string;
  chatId: string;
  threadId?: string;
};

export const TELEGRAM_REQUEST_TIMEOUT_MS = 15_000;

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
  if (
    typeof fromParams === "number" &&
    Number.isFinite(fromParams) &&
    fromParams > 0
  ) {
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

/** POST sendMessage; returns delivery attempt outcome (no token/PII in errors). */
export async function sendTelegramHtmlMessage(options: {
  config: TelegramConfig;
  text: string;
  fetchImpl?: FetchLike;
  timeoutMs?: number;
}): Promise<DeliveryAttemptResult> {
  const {
    config,
    text,
    fetchImpl = fetch,
    timeoutMs = TELEGRAM_REQUEST_TIMEOUT_MS,
  } = options;

  const body: Record<string, unknown> = {
    chat_id: config.chatId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
  };
  if (config.threadId) {
    body.message_thread_id = Number(config.threadId);
  }

  const started = Date.now();
  const deadlineAt = started + timeoutMs;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetchImpl(
      `https://api.telegram.org/bot${config.botToken}/sendMessage`,
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
      remoteReference: `tg:${config.chatId}:${json.result.message_id}`,
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
  return {
    outcome: "failed",
    sanitizedError: `telegram_${response.status}:${desc || "rejected"}`,
  };
}
