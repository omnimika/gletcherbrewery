import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  parseTelegramRetryAfterMs,
  TelegramDeliveryAdapter,
} from "./telegram-adapter";

describe("parseTelegramRetryAfterMs", () => {
  it("reads parameters.retry_after seconds", () => {
    assert.equal(
      parseTelegramRetryAfterMs({ parameters: { retry_after: 42 } }),
      42_000,
    );
  });

  it("parses description fallback", () => {
    assert.equal(
      parseTelegramRetryAfterMs({
        description: "Too Many Requests: retry after 17",
      }),
      17_000,
    );
  });

  it("falls back when absent", () => {
    assert.equal(parseTelegramRetryAfterMs({}), 30_000);
  });
});

describe("TelegramDeliveryAdapter", () => {
  const loadFields = async () => ({
    formId: "contacts",
    sourcePath: "/contacts",
    locale: "ru",
    fields: { name: "A", email: "a@b.c", phone: "+7" },
  });

  it("uses retry_after from 429 body", async () => {
    const adapter = new TelegramDeliveryAdapter(
      { botToken: "t", chatId: "-100" },
      loadFields,
      async () =>
        new Response(
          JSON.stringify({
            ok: false,
            description: "Too Many Requests: retry after 12",
            parameters: { retry_after: 12 },
          }),
          { status: 429 },
        ),
    );

    const result = await adapter.deliver({
      id: "j1",
      submissionId: "s1",
      sourceKind: "form_submission",
      sourceId: "s1",
      destination: "telegram",
      status: "leased",
      attempts: 0,
    });
    assert.equal(result.outcome, "retryable");
    if (result.outcome === "retryable") {
      assert.equal(result.retryAfterMs, 12_000);
    }
  });

  it("marks ambiguous when body read exceeds deadline", async () => {
    const adapter = new TelegramDeliveryAdapter(
      { botToken: "t", chatId: "-100" },
      loadFields,
      async () =>
        new Response(
          new ReadableStream({
            start(controller) {
              // never enqueue — hang until deadline
              void controller;
            },
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      50,
    );

    const result = await adapter.deliver({
      id: "j1",
      submissionId: "s1",
      sourceKind: "form_submission",
      sourceId: "s1",
      destination: "telegram",
      status: "leased",
      attempts: 0,
    });
    assert.equal(result.outcome, "ambiguous");
    if (result.outcome === "ambiguous") {
      assert.match(result.sanitizedError, /timeout/);
    }
  });
});
