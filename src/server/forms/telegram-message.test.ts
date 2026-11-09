import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatLeadTelegramHtml } from "./telegram-message";

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
    assert.doesNotMatch(html, /Город/);
    assert.doesNotMatch(html, /Компания/);
  });

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
