import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatAgentApplicationTelegramHtml,
  formatReceiptTelegramHtml,
} from "./telegram-message";

describe("loyalty telegram messages", () => {
  it("formats receipt with CRM link", () => {
    const html = formatReceiptTelegramHtml({
      receiptId: "rec-1",
      email: "a@b.c",
      displayName: "Иван",
      city: "Москва",
      venue: "Пятёрочка",
      gletcherSumRub: "1000.00",
      proposedEarn: 50,
      source: "manual",
      purchaseAt: "2026-11-16",
    });
    assert.match(html, /Чек из кабинета/);
    assert.match(html, /rec-1/);
    assert.match(html, /staff\/loyalty\/receipts/);
    assert.match(html, /50/);
  });

  it("formats agent application with CRM link", () => {
    const html = formatAgentApplicationTelegramHtml({
      applicationId: "app-1",
      email: "a@b.c",
      displayName: null,
      phone: "+7900",
      city: "Москва",
      venueName: "Бар",
      venueType: "Бар",
      venueAddress: "ул. 1",
      venueBoss: null,
      comment: null,
    });
    assert.match(html, /Стать агентом/);
    assert.match(html, /app-1/);
    assert.match(html, /staff\/loyalty\/agents/);
  });
});
