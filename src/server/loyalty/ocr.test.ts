import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseReceiptTextLines, proposeEarnFromOcrText } from "./ocr";
import { decodeFiscalQrFromImage } from "./qr-decode";
import { bootstrapAliasRows } from "./seed-aliases";

describe("ocr text parse", () => {
  it("extracts lines and matches Gletcher aliases", () => {
    const text = `
ООО Ромашка
Пиво Friday Avenue APA 0.5     200.00
Вода 0.5                       40.00
GLETCHER Blanche de Fleur      180.00
ИТОГО                          420.00
`;
    const lines = parseReceiptTextLines(text);
    assert.equal(lines.length, 3);
    const proposal = proposeEarnFromOcrText(text, bootstrapAliasRows());
    assert.equal(proposal.eligibleSum, 380);
    assert.equal(proposal.proposedEarn, 19);
    assert.equal(proposal.matchedCount, 2);
  });

  it("extracts GTIN from line and matches by gtin column", () => {
    const text = `4607041234567 Friday Avenue APA 0.5    199.90`;
    const lines = parseReceiptTextLines(text);
    assert.equal(lines.length, 1);
    assert.equal(lines[0]!.gtin, "4607041234567");
    const aliases = [
      ...bootstrapAliasRows(),
      {
        aliasNormalized: "gtin 4607041234567",
        productSlug: "friday-avenue-apa",
        gtin: "4607041234567",
      },
    ];
    const proposal = proposeEarnFromOcrText(text, aliases);
    assert.equal(proposal.eligibleSum, 199.9);
    assert.equal(proposal.matchedCount, 1);
  });
});

describe("qr-decode", () => {
  it("returns null on garbage bytes", () => {
    assert.equal(
      decodeFiscalQrFromImage(Buffer.from("not-an-image"), "image/jpeg"),
      null,
    );
  });
});
