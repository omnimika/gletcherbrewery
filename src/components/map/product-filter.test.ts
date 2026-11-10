import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildMapProductFilter,
  HAS_PRODUCT_FILTER,
} from "./product-filter";

describe("buildMapProductFilter", () => {
  it("hides empty Product when no beer selected", () => {
    assert.deepEqual(buildMapProductFilter(new Set()), HAS_PRODUCT_FILTER);
  });

  it("requires Product and matches any selected beer", () => {
    const filter = buildMapProductFilter(new Set(["Ausweis", "CYNIC"]));
    assert.equal(filter[0], "all");
    assert.deepEqual(filter[1], HAS_PRODUCT_FILTER);
    assert.deepEqual(filter[2], [
      "any",
      ["in", "Ausweis", ["coalesce", ["get", "Product"], ""]],
      ["in", "CYNIC", ["coalesce", ["get", "Product"], ""]],
    ]);
  });
});
