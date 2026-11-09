import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CATALOG_PRODUCTS, productsForAllView } from "@/content/products";
import { sortAllViewOrder } from "@/content/listing-order";

describe("listing-order series rule", () => {
  it("orders ALL as CLASSIC → CRAFT → LIMITED → AGING → OOS", () => {
    const ordered = productsForAllView(CATALOG_PRODUCTS).map((p) => p.slug);
    assert.deepEqual(ordered, [
      "ausweis",
      "heidegger-hell",
      "rouge-de-fleur",
      "milk-of-amnesia-non-alco",
      "milk-of-amnesia-v-tropic",
      "brainstorm",
      "blue-monkey",
      "nut-butter",
      "bowler-ipa",
      "underground-ale",
      "friday-avenue-apa",
      "iron-woods-dry-stout",
      "ruby-road",
      "tour-de-grapefruit",
      "cynic",
      "iron-woods-milk-stout",
      "hop-dragon",
      "brut-grapefruit",
    ]);
  });

  it("keeps OOS after in-stock even if category would place them earlier", () => {
    const rows = sortAllViewOrder([
      {
        id: "brut-grapefruit",
        category: "limited" as const,
        outOfStock: true,
      },
      { id: "cynic", category: "aging" as const },
      { id: "ausweis", category: "classic" as const },
    ]);
    assert.deepEqual(
      rows.map((r) => r.id),
      ["ausweis", "cynic", "brut-grapefruit"],
    );
  });
});
