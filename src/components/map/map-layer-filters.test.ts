import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { HAS_PRODUCT_FILTER } from "./product-filter";
import {
  buildMapLayerFilter,
  listMapChainOptions,
} from "./map-layer-filters";

describe("listMapChainOptions", () => {
  it("intersects style layers with CRM assortment allow-set", () => {
    const opts = listMapChainOptions(
      new Set(["МАКСИ", "АШАН", "ВКУСВИЛЛ", "EuroSPAR (Калининград)"]),
    );
    assert.ok(opts.some((c) => c.id === "МАКСИ"));
    assert.ok(opts.some((c) => c.id === "АШАН"));
    assert.ok(!opts.some((c) => c.id === "ВКУСВИЛЛ"));
    assert.ok(!opts.some((c) => c.id === "EuroSPAR (Калининград)"));
    assert.ok(!opts.some((c) => c.id === "SELGROS"));
    assert.ok(!opts.some((c) => c.id === "МИРАТОРГ"));
  });

  it("sorts chain labels alphabetically (ru)", () => {
    const opts = listMapChainOptions(
      new Set(["МАКСИ", "АШАН", "ЛЕНТА", "EuroSPAR", "ВИНЛАБ"]),
    );
    const labels = opts.map((c) => c.label);
    const sorted = [...labels].sort((a, b) => a.localeCompare(b, "ru"));
    assert.deepEqual(labels, sorted);
  });
});

describe("buildMapLayerFilter", () => {
  it("shows all layers with Product-only filter when no chains selected", () => {
    const r = buildMapLayerFilter("maksi", new Set(), new Set());
    assert.equal(r.visible, true);
    assert.deepEqual(r.filter, HAS_PRODUCT_FILTER);
  });

  it("hides layers with no matching selected chain", () => {
    const r = buildMapLayerFilter("maksi", new Set(), new Set(["АШАН"]));
    assert.equal(r.visible, false);
  });

  it("filters auchan-atak by АШАН Title aliases", () => {
    const r = buildMapLayerFilter("auchan-atak", new Set(), new Set(["АШАН"]));
    assert.equal(r.visible, true);
    assert.deepEqual(r.filter, [
      "all",
      HAS_PRODUCT_FILTER,
      [
        "any",
        ["==", ["get", "Title"], "АШАН"],
        ["==", ["get", "Title"], "Ашан"],
      ],
    ]);
  });

  it("combines beer and chain constraints", () => {
    const r = buildMapLayerFilter(
      "maksi",
      new Set(["Ausweis"]),
      new Set(["МАКСИ"]),
    );
    assert.equal(r.visible, true);
    assert.deepEqual(r.filter, [
      "all",
      [
        "all",
        HAS_PRODUCT_FILTER,
        ["any", ["in", "Ausweis", ["coalesce", ["get", "Product"], ""]]],
      ],
      [
        "any",
        ["==", ["get", "Title"], "Макси"],
        ["==", ["get", "Title"], "МАКСИ"],
      ],
    ]);
  });
});

