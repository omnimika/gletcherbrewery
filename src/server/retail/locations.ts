/**
 * Staff CRM queries for store points (retail_locations).
 */

import { and, asc, count, desc, eq, ilike, or, sql } from "drizzle-orm";
import type { AppDb } from "@/server/db/client";
import { retailChains, retailLocations } from "@/server/db/schema";

export type LocationSummaryRow = {
  chainId: string | null;
  chainTitle: string | null;
  locationCount: number;
  unmatchedCount: number;
};

export type LocationListItem = {
  id: string;
  chainId: string | null;
  chainTitle: string | null;
  mapLayerId: string | null;
  sourceTitle: string;
  type: string | null;
  city: string | null;
  adress: string | null;
  longitude: number;
  latitude: number;
  status: string;
  assortmentMode: string;
  productSnapshot: string | null;
  sourceFile: string;
  importedAt: string;
};

export async function getLocationSummary(
  db: AppDb,
): Promise<{
  total: number;
  unmatched: number;
  byChain: LocationSummaryRow[];
}> {
  const [totalRow] = await db
    .select({ n: count() })
    .from(retailLocations);
  const [unmatchedRow] = await db
    .select({ n: count() })
    .from(retailLocations)
    .where(eq(retailLocations.status, "unmatched"));

  const byChain = await db
    .select({
      chainId: retailLocations.chainId,
      chainTitle: retailChains.title,
      locationCount: count(),
      unmatchedCount: sql<number>`count(*) filter (where ${retailLocations.status} = 'unmatched')`,
    })
    .from(retailLocations)
    .leftJoin(retailChains, eq(retailLocations.chainId, retailChains.id))
    .groupBy(retailLocations.chainId, retailChains.title)
    .orderBy(desc(count()), asc(retailChains.title));

  return {
    total: Number(totalRow?.n ?? 0),
    unmatched: Number(unmatchedRow?.n ?? 0),
    byChain: byChain.map((r) => ({
      chainId: r.chainId,
      chainTitle: r.chainTitle,
      locationCount: Number(r.locationCount),
      unmatchedCount: Number(r.unmatchedCount),
    })),
  };
}

export async function listLocations(
  db: AppDb,
  input: {
    chainId?: string | null;
    status?: string | null;
    q?: string | null;
    limit?: number;
    offset?: number;
  } = {},
): Promise<{ items: LocationListItem[]; total: number }> {
  const limit = Math.min(Math.max(input.limit ?? 100, 1), 500);
  const offset = Math.max(input.offset ?? 0, 0);

  const filters = [];
  if (input.chainId === "unmatched") {
    filters.push(eq(retailLocations.status, "unmatched"));
  } else if (input.chainId) {
    filters.push(eq(retailLocations.chainId, input.chainId));
  }
  if (input.status) {
    filters.push(eq(retailLocations.status, input.status));
  }
  if (input.q?.trim()) {
    const q = `%${input.q.trim()}%`;
    filters.push(
      or(
        ilike(retailLocations.adress, q),
        ilike(retailLocations.city, q),
        ilike(retailLocations.sourceTitle, q),
      )!,
    );
  }
  const where = filters.length ? and(...filters) : undefined;

  const [totalRow] = await db
    .select({ n: count() })
    .from(retailLocations)
    .where(where);

  const rows = await db
    .select({
      id: retailLocations.id,
      chainId: retailLocations.chainId,
      chainTitle: retailChains.title,
      mapLayerId: retailLocations.mapLayerId,
      sourceTitle: retailLocations.sourceTitle,
      type: retailLocations.type,
      city: retailLocations.city,
      adress: retailLocations.adress,
      longitude: retailLocations.longitude,
      latitude: retailLocations.latitude,
      status: retailLocations.status,
      assortmentMode: retailLocations.assortmentMode,
      productSnapshot: retailLocations.productSnapshot,
      sourceFile: retailLocations.sourceFile,
      importedAt: retailLocations.importedAt,
    })
    .from(retailLocations)
    .leftJoin(retailChains, eq(retailLocations.chainId, retailChains.id))
    .where(where)
    .orderBy(
      asc(retailChains.title),
      asc(retailLocations.city),
      asc(retailLocations.adress),
    )
    .limit(limit)
    .offset(offset);

  return {
    total: Number(totalRow?.n ?? 0),
    items: rows.map((r) => ({
      id: r.id,
      chainId: r.chainId,
      chainTitle: r.chainTitle,
      mapLayerId: r.mapLayerId,
      sourceTitle: r.sourceTitle,
      type: r.type,
      city: r.city,
      adress: r.adress,
      longitude: r.longitude,
      latitude: r.latitude,
      status: r.status,
      assortmentMode: r.assortmentMode,
      productSnapshot: r.productSnapshot,
      sourceFile: r.sourceFile,
      importedAt: r.importedAt.toISOString(),
    })),
  };
}
