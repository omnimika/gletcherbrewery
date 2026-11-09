/**
 * Controlled Mapbox tileset Product publish.
 *
 * Default: dry-run — recipe + audit only.
 * Live: requires MAPBOX_ALLOW_TILESET_PUBLISH=true and confirmed username/tileset IDs.
 * Production tilesets are never mutated without that gate.
 */

import { desc } from "drizzle-orm";
import type { AppDb } from "@/server/db/client";
import { retailTilesetPublishRuns } from "@/server/db/schema";
import {
  buildTilesetPublishRecipe,
  type TilesetPublishRecipe,
} from "@/server/retail/tileset-recipe";

export type PublishRunSummary = {
  id: string;
  mode: "dry_run" | "live";
  status: "prepared" | "blocked" | "published" | "failed";
  recipe: TilesetPublishRecipe;
  result: Record<string, unknown> | null;
  createdAt: string;
};

function secretToken(): string | undefined {
  return process.env.MAPBOX_SECRET_TOKEN || process.env.MAPBOX_TOKEN || undefined;
}

export async function runTilesetPublish(
  db: AppDb,
  input: { mode: "dry_run" | "live"; actor: string },
): Promise<
  | { ok: true; run: PublishRunSummary }
  | { ok: false; code: string; message: string; run?: PublishRunSummary }
> {
  const recipe = await buildTilesetPublishRecipe(db, { mode: input.mode });

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
    // Live path reserved: upload/replace requires Confirmed tileset source workflow.
    // Do not call Mapbox Uploads until MAPBOX_TILESET_IDS + source format Confirmed.
    const token = secretToken();
    const username = process.env.MAPBOX_USERNAME!;
    const tilesetIds = process.env.MAPBOX_TILESET_IDS!.split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const [row] = await db
      .insert(retailTilesetPublishRuns)
      .values({
        mode: "live",
        status: "failed",
        actor: input.actor,
        recipe: recipe as unknown as Record<string, unknown>,
        result: {
          reason: "live_uploader_not_wired",
          message:
            "Recipe ready, but Mapbox upload/replace adapter is not enabled until tileset source format is Confirmed.",
          username,
          tilesetIds,
          tokenPresent: Boolean(token),
          patchCount: recipe.patches.length,
        },
      })
      .returning();

    return {
      ok: false,
      code: "uploader_pending",
      message:
        "Live uploader not wired yet — dry-run recipe is ready; confirm tileset source IDs/format next.",
      run: toSummary(row!),
    };
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
