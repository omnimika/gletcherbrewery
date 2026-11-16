import { CATALOG_PRODUCTS } from "@/content/products";
import { activeProductGtins } from "@/content/product-gtins";
import { normalizeReceiptAlias } from "./normalize-alias";

/**
 * Bootstrap alias strings (кир+лат). Expand from catalog + manual brand forms.
 * Not a complete production dictionary — seed for matcher / CRM.
 */
const MANUAL_ALIASES: { raw: string; productSlug?: string }[] = [
  { raw: "gletcher" },
  { raw: "глетчер" },
  { raw: "gletcher brewery" },
  { raw: "пивоварня глетчер" },
  { raw: "friday avenue", productSlug: "friday-avenue-apa" },
  { raw: "фрайдей авеню", productSlug: "friday-avenue-apa" },
  { raw: "friday avenue apa", productSlug: "friday-avenue-apa" },
  // Blanche not in current catalog slugs — brand alias only until Confirmed SKU.
  { raw: "blanche de fleur" },
  { raw: "бланш де флер" },
  { raw: "rouge de fleur", productSlug: "rouge-de-fleur" },
  { raw: "руж де флер", productSlug: "rouge-de-fleur" },
  { raw: "brainstorm", productSlug: "brainstorm" },
  { raw: "брейнсторм", productSlug: "brainstorm" },
  { raw: "heidegger", productSlug: "heidegger-hell" },
  { raw: "хайдеггер", productSlug: "heidegger-hell" },
  { raw: "bowler", productSlug: "bowler-ipa" },
  { raw: "боулер", productSlug: "bowler-ipa" },
  { raw: "nut butter", productSlug: "nut-butter" },
  { raw: "нат баттер", productSlug: "nut-butter" },
  { raw: "tour de grapefruit", productSlug: "tour-de-grapefruit" },
  { raw: "тур де грейпфрут", productSlug: "tour-de-grapefruit" },
  { raw: "hop dragon", productSlug: "hop-dragon" },
  { raw: "хоп дрэгон", productSlug: "hop-dragon" },
  { raw: "blue monkey", productSlug: "blue-monkey" },
  { raw: "блу манки", productSlug: "blue-monkey" },
  { raw: "iron woods", productSlug: "iron-woods-dry-stout" },
  { raw: "айрон вудс", productSlug: "iron-woods-dry-stout" },
];

export type SeedAlias = {
  aliasNormalized: string;
  productSlug: string | null;
  brand: "gletcher";
  gtin?: string | null;
};

export function bootstrapAliasRows(): SeedAlias[] {
  const byNorm = new Map<string, SeedAlias>();

  for (const a of MANUAL_ALIASES) {
    const aliasNormalized = normalizeReceiptAlias(a.raw);
    if (aliasNormalized.length < 3) continue;
    byNorm.set(aliasNormalized, {
      aliasNormalized,
      productSlug: a.productSlug ?? null,
      brand: "gletcher",
    });
  }

  for (const p of CATALOG_PRODUCTS) {
    for (const raw of [p.name, p.title, p.slug.replace(/-/g, " ")]) {
      const aliasNormalized = normalizeReceiptAlias(raw);
      if (aliasNormalized.length < 3) continue;
      if (!byNorm.has(aliasNormalized)) {
        byNorm.set(aliasNormalized, {
          aliasNormalized,
          productSlug: p.slug,
          brand: "gletcher",
        });
      }
    }
  }

  for (const g of activeProductGtins()) {
    // Dedicated GTIN key so matcher can load via aliasNormalized or gtin column.
    const aliasNormalized = `gtin ${g.gtin}`;
    byNorm.set(aliasNormalized, {
      aliasNormalized,
      productSlug: g.productSlug,
      brand: "gletcher",
      gtin: g.gtin,
    });
  }

  return [...byNorm.values()];
}

/** @deprecated use bootstrapAliasRows */
export const BOOTSTRAP_RECEIPT_ALIASES = MANUAL_ALIASES;
