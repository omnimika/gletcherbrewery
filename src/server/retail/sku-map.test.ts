import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ASSORTMENT_COLUMNS,
  isAssortmentSkuOutOfStock,
  parseSheetBool,
  SHEET_BEER_COLUMNS,
} from "./sku-map";

describe("sku-map", () => {
  it("maps Friday Avenue APA to catalog Friday Avenue slug", () => {
    const col = SHEET_BEER_COLUMNS.find(
      (c) => c.sheetHeader === "Friday Avenue APA",
    );
    assert.equal(col?.catalogName, "Friday Avenue");
    assert.equal(col?.productSlug, "friday-avenue-apa");
  });

  it("maps Iron Woods Stout to Iron Woods Dry Stout", () => {
    const col = SHEET_BEER_COLUMNS.find(
      (c) => c.sheetHeader === "Iron Woods Stout",
    );
    assert.equal(col?.catalogName, "Iron Woods Dry Stout");
  });

  it("includes Iron Woods Milk Stout as extra catalog column", () => {
    assert.ok(
      ASSORTMENT_COLUMNS.some((c) => c.productSlug === "iron-woods-milk-stout"),
    );
  });

  it("orders matrix columns CLASSIC→CRAFT→LIMITED→AGING→OOS", () => {
    assert.equal(ASSORTMENT_COLUMNS[0]?.productSlug, "ausweis");
    assert.equal(
      ASSORTMENT_COLUMNS[ASSORTMENT_COLUMNS.length - 1]?.productSlug,
      "brut-grapefruit",
    );
    const cynic = ASSORTMENT_COLUMNS.findIndex((c) => c.productSlug === "cynic");
    const milkOos = ASSORTMENT_COLUMNS.findIndex(
      (c) => c.productSlug === "iron-woods-milk-stout",
    );
    assert.ok(cynic >= 0 && milkOos > cynic);
  });

  it("parses sheet booleans", () => {
    assert.equal(parseSheetBool("TRUE"), true);
    assert.equal(parseSheetBool("FALSE"), false);
    assert.equal(parseSheetBool(""), false);
  });

  it("marks discontinued catalog SKUs as out of stock", () => {
    assert.equal(isAssortmentSkuOutOfStock("brut-grapefruit"), true);
    assert.equal(isAssortmentSkuOutOfStock("hop-dragon"), true);
    assert.equal(isAssortmentSkuOutOfStock("iron-woods-milk-stout"), true);
    assert.equal(isAssortmentSkuOutOfStock("ausweis"), false);
  });
});
