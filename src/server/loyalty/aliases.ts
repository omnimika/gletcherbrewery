import { eq } from "drizzle-orm";
import type { AppDb } from "@/server/db/client";
import { productReceiptAliases } from "@/server/db/schema";
import type { AliasRow } from "./match-lines";
import { bootstrapAliasRows } from "./seed-aliases";

export async function loadActiveAliases(db: AppDb): Promise<AliasRow[]> {
  const rows = await db
    .select({
      aliasNormalized: productReceiptAliases.aliasNormalized,
      productSlug: productReceiptAliases.productSlug,
      gtin: productReceiptAliases.gtin,
    })
    .from(productReceiptAliases)
    .where(eq(productReceiptAliases.active, true));
  if (rows.length > 0) return rows;
  return bootstrapAliasRows();
}

/** Upsert bootstrap dictionary into DB (idempotent by alias_normalized). */
export async function seedProductReceiptAliases(db: AppDb): Promise<{
  inserted: number;
  updated: number;
  total: number;
}> {
  const seeds = bootstrapAliasRows();
  let inserted = 0;
  let updated = 0;
  for (const seed of seeds) {
    const existing = await db
      .select({
        id: productReceiptAliases.id,
        gtin: productReceiptAliases.gtin,
        productSlug: productReceiptAliases.productSlug,
      })
      .from(productReceiptAliases)
      .where(eq(productReceiptAliases.aliasNormalized, seed.aliasNormalized))
      .limit(1);
    if (existing[0]) {
      const needsGtin =
        seed.gtin && existing[0].gtin !== seed.gtin;
      const needsSlug =
        seed.productSlug && existing[0].productSlug !== seed.productSlug;
      if (needsGtin || needsSlug) {
        await db
          .update(productReceiptAliases)
          .set({
            gtin: seed.gtin ?? existing[0].gtin,
            productSlug: seed.productSlug ?? existing[0].productSlug,
            active: true,
          })
          .where(eq(productReceiptAliases.id, existing[0].id));
        updated += 1;
      }
      continue;
    }
    await db.insert(productReceiptAliases).values({
      aliasNormalized: seed.aliasNormalized,
      productSlug: seed.productSlug,
      brand: seed.brand,
      gtin: seed.gtin ?? null,
      active: true,
    });
    inserted += 1;
  }
  return { inserted, updated, total: seeds.length };
}

/** Staff/CRM: upsert one alias or GTIN mapping. */
export async function upsertReceiptAlias(
  db: AppDb,
  input: {
    aliasNormalized: string;
    productSlug?: string | null;
    gtin?: string | null;
    active?: boolean;
  },
) {
  const aliasNormalized = input.aliasNormalized.trim();
  if (aliasNormalized.length < 2) {
    return { ok: false as const, code: "invalid_alias" as const };
  }
  const existing = await db
    .select({ id: productReceiptAliases.id })
    .from(productReceiptAliases)
    .where(eq(productReceiptAliases.aliasNormalized, aliasNormalized))
    .limit(1);
  if (existing[0]) {
    const [row] = await db
      .update(productReceiptAliases)
      .set({
        productSlug: input.productSlug ?? null,
        gtin: input.gtin ?? null,
        active: input.active ?? true,
      })
      .where(eq(productReceiptAliases.id, existing[0].id))
      .returning();
    return { ok: true as const, alias: row!, created: false };
  }
  const [row] = await db
    .insert(productReceiptAliases)
    .values({
      aliasNormalized,
      productSlug: input.productSlug ?? null,
      gtin: input.gtin ?? null,
      brand: "gletcher",
      active: input.active ?? true,
    })
    .returning();
  return { ok: true as const, alias: row!, created: true };
}
