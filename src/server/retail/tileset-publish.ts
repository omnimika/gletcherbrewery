/**
 * Controlled Mapbox tileset Product publish.
 *
 * Default: dry-run — recipe + audit only.
 * Live: MAPBOX_ALLOW_TILESET_PUBLISH=true + staged GeoJSON → Mapbox upload.
 */

import fs from "node:fs";
import path from "node:path";
import { desc } from "drizzle-orm";
import type { AppDb } from "@/server/db/client";
import { retailTilesetPublishRuns } from "@/server/db/schema";
import { RETAIL_TILESET_IDS } from "@/server/retail/mapbox-tilesets";
import { uploadAllStagedLayers } from "@/server/retail/mapbox-upload";
import { patchLocalProductSources } from "@/server/retail/patch-product-sources";
import {
  buildTilesetPublishRecipe,
  type TilesetPublishRecipe,
} from "@/server/retail/tileset-recipe";

export type PublishRunSummary = {
  id: string;
  mode: "dry_run" | "live";
  status: "prepared" | "blocked" | "published" | "failed" | "partial";
  recipe: TilesetPublishRecipe;
  result: Record<string, unknown> | null;
  createdAt: string;
};

function secretToken(): string | undefined {
  return process.env.MAPBOX_SECRET_TOKEN || process.env.MAPBOX_TOKEN || undefined;
}

function enrichBlockers(recipe: TilesetPublishRecipe): TilesetPublishRecipe {
  const hasIds =
    Boolean(process.env.MAPBOX_TILESET_IDS?.trim()) ||
    RETAIL_TILESET_IDS.length > 0;
  const next: string[] = [];
  if (!secretToken()?.startsWith("sk.")) {
    next.push("MAPBOX_SECRET_TOKEN / MAPBOX_TOKEN (sk.…) missing");
  }
  if (!process.env.MAPBOX_USERNAME?.trim()) {
    next.push("MAPBOX_USERNAME missing");
  }
  if (!hasIds) {
    next.push("MAPBOX_TILESET_IDS missing");
  }
  if (process.env.MAPBOX_ALLOW_TILESET_PUBLISH !== "true") {
    next.push("MAPBOX_ALLOW_TILESET_PUBLISH is not true");
  }
  return {
    ...recipe,
    blockers: next,
    livePublishReady: next.length === 0,
  };
}

export async function runTilesetPublish(
  db: AppDb,
  input: {
    mode: "dry_run" | "live";
    actor: string;
    repoRoot?: string;
    onlyLayerIds?: string[];
  },
): Promise<
  | { ok: true; run: PublishRunSummary }
  | { ok: false; code: string; message: string; run?: PublishRunSummary }
> {
  const recipe = enrichBlockers(
    await buildTilesetPublishRecipe(db, { mode: input.mode }),
  );
  const repoRoot = input.repoRoot ?? process.cwd();

  if (input.mode === "live" && !recipe.livePublishReady) {
    const [row] = await db
      .insert(retailTilesetPublishRuns)
      .values({
        mode: "live",
        status: "blocked",
        actor: input.actor,
        recipe: recipe as unknown as Record<string, unknown>,
        result: { blockers: recipe.blockers },
      })
      .returning();

    return {
      ok: false,
      code: "publish_blocked",
      message: `Live publish blocked: ${recipe.blockers.join("; ")}`,
      run: toSummary(row!),
    };
  }

  if (input.mode === "live") {
    const { reports, outDir } = patchLocalProductSources({
      patches: recipe.patches,
      repoRoot,
    });

    const uploads = await uploadAllStagedLayers({
      stagedDir: outDir,
      onlyLayerIds: input.onlyLayerIds,
    });
    const okCount = uploads.filter((u) => u.ok).length;
    const failCount = uploads.length - okCount;
    const status =
      failCount === 0 ? "published" : okCount === 0 ? "failed" : "partial";

    const [row] = await db
      .insert(retailTilesetPublishRuns)
      .values({
        mode: "live",
        status,
        actor: input.actor,
        recipe: recipe as unknown as Record<string, unknown>,
        result: {
          stagedDir: path.relative(repoRoot, outDir),
          patchReports: reports.map((r) => ({
            layerId: r.layerId,
            updated: r.updated,
            features: r.featureCount,
            unmatchedTitles: r.unmatchedTitles,
            quality: r.quality,
          })),
          uploads,
          okCount,
          failCount,
        },
      })
      .returning();

    if (status === "failed") {
      return {
        ok: false,
        code: "upload_failed",
        message: `All ${failCount} layer uploads failed`,
        run: toSummary(row!),
      };
    }

    return {
      ok: true,
      run: toSummary(row!),
    };
  }

  // dry-run: recipe + optional local patch stats if sources exist
  let patchSummary: Record<string, unknown> | null = null;
  const sourcesDir = path.join(repoRoot, "tmp/mapbox-sources");
  if (fs.existsSync(sourcesDir)) {
    try {
      const { reports, outDir } = patchLocalProductSources({
        patches: recipe.patches,
        repoRoot,
      });
      patchSummary = {
        stagedDir: path.relative(repoRoot, outDir),
        updated: reports.reduce((n, r) => n + r.updated, 0),
        features: reports.reduce((n, r) => n + r.featureCount, 0),
      };
    } catch (err) {
      patchSummary = {
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  const [row] = await db
    .insert(retailTilesetPublishRuns)
    .values({
      mode: "dry_run",
      status: "prepared",
      actor: input.actor,
      recipe: recipe as unknown as Record<string, unknown>,
      result: {
        patchCount: recipe.patches.length,
        nonEmptyProducts: recipe.patches.filter((p) => p.product).length,
        livePublishReady: recipe.livePublishReady,
        blockers: recipe.blockers,
        localPatch: patchSummary,
      },
    })
    .returning();

  return { ok: true, run: toSummary(row!) };
}

export async function listRecentTilesetPublishRuns(
  db: AppDb,
  limit = 5,
): Promise<PublishRunSummary[]> {
  const rows = await db
    .select()
    .from(retailTilesetPublishRuns)
    .orderBy(desc(retailTilesetPublishRuns.createdAt))
    .limit(limit);
  return rows.map(toSummary);
}

function toSummary(row: {
  id: string;
  mode: string;
  status: string;
  recipe: Record<string, unknown>;
  result: Record<string, unknown> | null;
  createdAt: Date;
}): PublishRunSummary {
  return {
    id: row.id,
    mode: row.mode as PublishRunSummary["mode"],
    status: row.status as PublishRunSummary["status"],
    recipe: row.recipe as unknown as TilesetPublishRecipe,
    result: row.result,
    createdAt: row.createdAt.toISOString(),
  };
}
