import { getDb } from "../src/server/db/client";
import { runTilesetPublish } from "../src/server/retail/tileset-publish";

async function main() {
  const result = await runTilesetPublish(getDb(), {
    mode: "dry_run",
    actor: "cli:retail-tileset-dry-run",
  });
  if (!result.ok || !result.run) {
    console.error(result);
    process.exit(1);
  }
  const { run } = result;
  console.log(
    JSON.stringify(
      {
        id: run.id,
        status: run.status,
        patchCount: run.recipe.patches.length,
        nonEmpty: run.recipe.patches.filter((p) => p.product).length,
        blockers: run.recipe.blockers,
        sample: run.recipe.patches
          .filter((p) => p.product)
          .slice(0, 5)
          .map((p) => ({ title: p.chainTitle, product: p.product })),
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
