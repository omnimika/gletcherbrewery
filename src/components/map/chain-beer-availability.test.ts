import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  enabledBeerKeysForChains,
  pruneBeerSelection,
} from "./chain-beer-availability";

const beersByChain = {
  АШАН: ["Ausweis", "Blue Monkey"],
  МАГНИТ: ["Ausweis", "CYNIC"],
};

describe("enabledBeerKeysForChains", () => {
  it("returns null when no chains selected (all beers enabled)", () => {
    assert.equal(
      enabledBeerKeysForChains(new Set(), beersByChain),
      null,
    );
  });

  it("unions beers across selected chains", () => {
    const enabled = enabledBeerKeysForChains(
      new Set(["АШАН", "МАГНИТ"]),
      beersByChain,
    );
    assert.ok(enabled);
    assert.deepEqual([...enabled!].sort(), [
      "Ausweis",
      "Blue Monkey",
      "CYNIC",
    ]);
  });

  it("returns empty set when selected chain has no mapped beers", () => {
    const enabled = enabledBeerKeysForChains(
      new Set(["НЕИЗВЕСТНАЯ"]),
      beersByChain,
    );
    assert.ok(enabled);
    assert.equal(enabled!.size, 0);
  });
});

describe("pruneBeerSelection", () => {
  it("keeps all when enabled is null", () => {
    const next = pruneBeerSelection(new Set(["Ausweis", "CYNIC"]), null);
    assert.deepEqual([...next].sort(), ["Ausweis", "CYNIC"]);
  });

  it("drops beers not in enabled set", () => {
    const next = pruneBeerSelection(
      new Set(["Ausweis", "CYNIC", "Blue Monkey"]),
      new Set(["Ausweis"]),
    );
    assert.deepEqual([...next], ["Ausweis"]);
  });
});
