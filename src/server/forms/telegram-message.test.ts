import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatContactsTelegramHtml } from "./telegram-message";

describe("formatContactsTelegramHtml", () => {
  it("escapes HTML and skips empty optional fields", () => {
    const html = formatContactsTelegramHtml({
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
    assert.doesNotMatch(html, /Город/);
    assert.doesNotMatch(html, /Компания/);
  });
});
