import { and, asc, eq } from "drizzle-orm";
import type { AppDb } from "@/server/db/client";
import {
  retailAssortmentEvents,
  retailChainProducts,
  retailChains,
} from "@/server/db/schema";
import { ASSORTMENT_COLUMNS, isAssortmentSkuOutOfStock } from "./sku-map";

export type AssortmentMatrix = {
  columns: Array<{
    productSlug: string;
    catalogName: string;
    outOfStock: boolean;
  }>;
  chains: Array<{
    id: string;
    slug: string;
    title: string;
    legalName: string | null;
    mapUrl: string | null;
    products: Record<string, boolean>;
  }>;
};

function slugifyTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^a-z0-9а-яa-z]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function getAssortmentMatrix(db: AppDb): Promise<AssortmentMatrix> {
  const chains = await db
    .select()
    .from(retailChains)
    .where(eq(retailChains.active, true))
    .orderBy(asc(retailChains.sortOrder), asc(retailChains.title));

  const products = await db.select().from(retailChainProducts);
  const byChain = new Map<string, Record<string, boolean>>();
  for (const row of products) {
    const bag = byChain.get(row.chainId) ?? {};
    bag[row.productSlug] = row.available;
    byChain.set(row.chainId, bag);
  }

  return {
    columns: ASSORTMENT_COLUMNS.map((c) => ({
      productSlug: c.productSlug,
      catalogName: c.catalogName,
      outOfStock: isAssortmentSkuOutOfStock(c.productSlug),
    })),
    chains: chains.map((c) => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
      legalName: c.legalName,
      mapUrl: c.mapUrl,
      products: byChain.get(c.id) ?? {},
    })),
  };
}

export async function setChainProductAvailability(
  db: AppDb,
  input: {
    chainId: string;
    productSlug: string;
    available: boolean;
    actor: string;
  },
): Promise<
  | { ok: true }
  | { ok: false; code: string; message: string }
> {
  const known = ASSORTMENT_COLUMNS.some(
    (c) => c.productSlug === input.productSlug,
  );
  if (!known) {
    return { ok: false, code: "unknown_sku", message: "Unknown product slug" };
  }
  if (isAssortmentSkuOutOfStock(input.productSlug)) {
    return {
      ok: false,
      code: "out_of_stock",
      message: "Сорт OUT OF STOCK — чекбокс недоступен",
    };
  }

  const chain = await db
    .select({ id: retailChains.id })
    .from(retailChains)
    .where(eq(retailChains.id, input.chainId))
    .limit(1);
  if (!chain[0]) {
    return { ok: false, code: "not_found", message: "Chain not found" };
  }

  const now = new Date();
  await db.transaction(async (tx) => {
    const existing = await tx
      .select()
      .from(retailChainProducts)
      .where(
        and(
          eq(retailChainProducts.chainId, input.chainId),
          eq(retailChainProducts.productSlug, input.productSlug),
        ),
      )
      .limit(1);

    const prev = existing[0]?.available ?? false;

    if (existing[0]) {
      await tx
        .update(retailChainProducts)
        .set({
          available: input.available,
          updatedAt: now,
          updatedBy: input.actor,
        })
        .where(
          and(
            eq(retailChainProducts.chainId, input.chainId),
            eq(retailChainProducts.productSlug, input.productSlug),
          ),
        );
    } else {
      await tx.insert(retailChainProducts).values({
        chainId: input.chainId,
        productSlug: input.productSlug,
        available: input.available,
        updatedAt: now,
        updatedBy: input.actor,
      });
    }

    await tx
      .update(retailChains)
      .set({ updatedAt: now, updatedBy: input.actor })
      .where(eq(retailChains.id, input.chainId));

    await tx.insert(retailAssortmentEvents).values({
      chainId: input.chainId,
      productSlug: input.productSlug,
      action: "set_available",
      actor: input.actor,
      payload: { from: prev, to: input.available },
      createdAt: now,
    });
  });

  return { ok: true };
}

export { slugifyTitle };
