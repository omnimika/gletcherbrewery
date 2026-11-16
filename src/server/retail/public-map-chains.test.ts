import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  loadPublicMapAssortmentFromFixture,
  loadPublicMapChainTitlesFromFixture,
} from "./public-map-chains";

describe("loadPublicMapChainTitlesFromFixture", () => {
  it("excludes empty-SKU on-map chains like SELGROS and МИРАТОРГ", () => {
    const titles = loadPublicMapChainTitlesFromFixture();
    assert.ok(titles.includes("АШАН"));
    assert.ok(titles.includes("МАКСИ"));
    assert.ok(titles.includes("ХМЕЛЬ И СОЛОД"));
    assert.ok(titles.includes("Яблоко (Крым)"));
    assert.ok(!titles.includes("SELGROS"));
    assert.ok(!titles.includes("МИРАТОРГ"));
    assert.ok(!titles.includes("ВКУСВИЛЛ"));
  });
});

describe("loadPublicMapAssortmentFromFixture", () => {
  it("maps available beers per chain as Product tokens", () => {
    const { beersByChain } = loadPublicMapAssortmentFromFixture();
    const aushan = beersByChain["АШАН"];
    assert.ok(aushan);
    assert.ok(aushan.includes("Ausweis"));
    assert.ok(!aushan.includes("CYNIC") || aushan.length > 0);
  });
});

