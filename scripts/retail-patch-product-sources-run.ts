import path from "node:path";
import { fileURLToPath } from "node:url";
import { getDb } from "../src/server/db/client";
import { loadLocationProductOverrides } from "../src/server/retail/location-assortment";
import { patchLocalProductSources } from "../src/server/retail/patch-product-sources";
import { buildTilesetPublishRecipe } from "../src/server/retail/tileset-recipe";

const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

async function main() {
  const db = getDb();
  const recipe = await buildTilesetPublishRecipe(db, { mode: "dry_run" });
  const locationOverrides = await loadLocationProductOverrides(db);
  const { reports, outDir } = patchLocalProductSources({
    patches: recipe.patches,
    repoRoot,
    locationOverridesBySourceKey: locationOverrides,
  });

  const summary = {
    outDir: path.relative(repoRoot, outDir),
    locationOverrides: locationOverrides.size,
    layers: reports.map((r) => ({
      layerId: r.layerId,
      quality: r.quality,
      features: r.featureCount,
      updated: r.updated,
      unchanged: r.unchanged,
      locationOverridesApplied: r.locationOverridesApplied,
      unmatchedTitles: r.unmatchedTitles,
    })),
    totals: {
      features: reports.reduce((n, r) => n + r.featureCount, 0),
      updated: reports.reduce((n, r) => n + r.updated, 0),
      locationOverridesApplied: reports.reduce(
        (n, r) => n + r.locationOverridesApplied,
        0,
      ),
      unmatchedTitleCount: reports.reduce(
        (n, r) => n + r.unmatchedTitles.length,
        0,
      ),
    },
  };
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
