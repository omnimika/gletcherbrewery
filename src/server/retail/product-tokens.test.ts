import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildProductProperty,
  catalogSlugForProductToken,
  parseProductProperty,
  productTokenForSlug,
} from "./product-tokens";

describe("product-tokens", () => {
  it("maps Iron Woods Dry Stout → Iron Woods filter token", () => {
    assert.equal(productTokenForSlug("iron-woods-dry-stout"), "Iron Woods");
    assert.equal(
      catalogSlugForProductToken("Tour De Grapefruit"),
      "tour-de-grapefruit",
    );
  });

  it("builds Product string in series order and skips OOS", () => {
    const product = buildProductProperty([
      "cynic",
      "brut-grapefruit",
      "ausweis",
      "friday-avenue-apa",
      "iron-woods-milk-stout",
    ]);
    assert.equal(product, "Ausweis, Friday Avenue, CYNIC");
    assert.ok(!product.includes("Brut"));
    assert.ok(!product.includes("Milk Stout"));
  });

  it("parses legacy Product without swallowing non-alco variant", () => {
    const slugs = parseProductProperty(
      "Milk of Amnesia non-alcoholic, Milk of Amnesia, Ausweis",
    );
    assert.deepEqual(slugs, [
      "ausweis",
      "milk-of-amnesia-non-alco",
      "milk-of-amnesia-v-tropic",
    ]);
  });
});
