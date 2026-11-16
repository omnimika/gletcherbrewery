import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { checkEarnBircoins } from "./earn";
import { receiptFingerprint, parseFiscalQrPayload } from "./fingerprint";
import { matchGletcherLines } from "./match-lines";
import { normalizeReceiptAlias, normalizeMemberEmail } from "./normalize-alias";
import { spendableBalance } from "./spendable";
import { bootstrapAliasRows } from "./seed-aliases";
import { legacyCheckImportStatus } from "./legacy-policy";

describe("loyalty earn 5%", () => {
  it("rounds gletcher sum * 0.05", () => {
    assert.equal(checkEarnBircoins(1000), 50);
    assert.equal(checkEarnBircoins(99.9), 5);
    assert.equal(checkEarnBircoins(0), 0);
  });
});

describe("normalize + match", () => {
  it("normalizes кир/лат", () => {
    assert.equal(normalizeReceiptAlias("  Глётчер  Brewery "), "глетчер brewery");
    assert.equal(normalizeMemberEmail(" CEO@Zabava.Group.RU "), "ceo@zabava.group.ru");
  });

  it("matches aliases from bootstrap seed", () => {
    const aliases = bootstrapAliasRows();
    const { matched, eligibleSum } = matchGletcherLines(
      [
        { name: "Пиво Friday Avenue APA 0.5", sum: 200 },
        { name: "Вода Святой источник", sum: 50 },
        { name: "GLETCHER Blanche de Fleur", sum: 180 },
      ],
      aliases,
    );
    assert.equal(matched.filter((m) => m.matched).length, 2);
    assert.equal(eligibleSum, 380);
    assert.equal(checkEarnBircoins(eligibleSum), 19);
  });
});

describe("fingerprint + legacy", () => {
  it("parses QR and builds fingerprint", () => {
    const p = parseFiscalQrPayload(
      "t=20261110T1842&s=1249.90&fn=8710000100518392&i=54812&fp=3522207165&n=1",
    );
    assert.equal(p.fn, "8710000100518392");
    assert.equal(p.fd, "54812");
    const fp = receiptFingerprint({
      fn: p.fn!,
      fd: p.fd!,
      fp: p.fp!,
      operation: p.operation,
    });
    assert.equal(fp, "8710000100518392|54812|3522207165|1");
  });

  it("upgrades legacy НЕТ to verified", () => {
    const r = legacyCheckImportStatus("НЕТ");
    assert.equal(r.receiptStatus, "verified");
    assert.equal(r.legacyPaidFlag, "НЕТ");
  });
});

describe("spendable", () => {
  it("sums posted earns and spends", () => {
    assert.equal(
      spendableBalance([
        { entryKind: "check_earn", amount: 50, status: "posted" },
        { entryKind: "check_earn", amount: 10, status: "voided" },
        { entryKind: "spend", amount: -15, status: "posted" },
      ]),
      35,
    );
  });
});
