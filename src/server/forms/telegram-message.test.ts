import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  fitTelegramHtml,
  formatLeadTelegramHtml,
  staffLeadCrmUrl,
  TELEGRAM_MESSAGE_MAX_CHARS,
} from "./telegram-message";

describe("formatLeadTelegramHtml", () => {
  it("escapes HTML and skips empty optional fields", () => {
    const html = formatLeadTelegramHtml({
      formId: "contacts",
      submissionId: "abc-123",
      sourcePath: "/contacts",
      locale: "ru",
      fields: {
        name: "Иван <test>",
        email: "a@b.c",
        phone: "+7 495",
        city: "",
        company: null,
        comment: "A & B",
      },
    });
    assert.match(html, /Иван &lt;test&gt;/);
    assert.match(html, /A &amp; B/);
    assert.match(html, /abc-123/);
    assert.match(html, /Контакты · \/contacts/);
    assert.match(html, /\/staff\/leads\/abc-123/);
    assert.doesNotMatch(html, /Город/);
    assert.doesNotMatch(html, /Компания/);
  });

  it("keeps ID and CRM link under Telegram length limit", () => {
    const long = "я".repeat(2000);
    const html = formatLeadTelegramHtml({
      formId: "contacts",
      submissionId: "sub-stable-id",
      sourcePath: "/contacts",
      locale: "ru",
      fields: {
        name: "N",
        comment: long,
        wishes: long,
        company: long,
      },
    });
    assert.ok(html.length <= TELEGRAM_MESSAGE_MAX_CHARS);
    assert.match(html, /sub-stable-id/);
    assert.match(html, /\/staff\/leads\/sub-stable-id/);
  });
});

describe("fitTelegramHtml", () => {
  it("drops trailing fields before hard clip", () => {
    const text = fitTelegramHtml(
      {
        header: "H",
        identity: ["ID: x"],
        fields: ["F1", "F2", "F3"],
        footer: ["CRM: /staff/leads/x"],
      },
      40,
    );
    assert.ok(text.length <= 40);
    assert.match(text, /ID: x/);
    assert.match(text, /CRM:/);
  });
});

describe("staffLeadCrmUrl", () => {
  it("builds private staff path", () => {
    assert.match(staffLeadCrmUrl("abc"), /\/staff\/leads\/abc$/);
  });
});

describe("formatLeadTelegramHtml headlines", () => {
  it("puts page path in headline for partnership", () => {
    const html = formatLeadTelegramHtml({
      formId: "partnership",
      submissionId: "p1",
      sourcePath: "/partnership",
      locale: "ru",
      fields: { name: "A", email: "a@b.c", phone: "+7", company: "X", city: "Y", type: "bar" },
    });
    assert.match(html, /Партнёрство \/ опт · \/partnership/);
    assert.doesNotMatch(html, /Contacts/);
  });

  it("labels partnership and tours fields", () => {
    const html = formatLeadTelegramHtml({
      formId: "tours_request",
      submissionId: "t1",
      sourcePath: "/tours",
      locale: "ru",
      fields: { name: "A", phone: "+7", date: "2026-12-01", guests: "4", email: "a@b.c" },
    });
    assert.match(html, /Экскурсия \(заявка\) · \/tours/);
    assert.match(html, /Дата/);
    assert.match(html, /Гостей/);
  });
});
