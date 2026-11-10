import path from "node:path";
import { fileURLToPath } from "node:url";
import { getDb } from "../src/server/db/client";
import { runTilesetPublish } from "../src/server/retail/tileset-publish";

const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const only = process.argv.slice(2);

async function main() {
  if (process.env.MAPBOX_ALLOW_TILESET_PUBLISH !== "true") {
    console.error("Refusing: set MAPBOX_ALLOW_TILESET_PUBLISH=true");
    process.exit(1);
  }

  const result = await runTilesetPublish(getDb(), {
    mode: "live",
    actor: "cli:retail-tileset-live",
    repoRoot,
    onlyLayerIds: only.length ? only : undefined,
  });

  const uploads =
    (result.run?.result?.uploads as Array<Record<string, unknown>>) ?? [];
  console.log(
    JSON.stringify(
      {
        ok: result.ok,
        code: "code" in result ? result.code : undefined,
        message: "message" in result ? result.message : undefined,
        status: result.run?.status,
        id: result.run?.id,
        uploads: uploads.map((u) => ({
          layerId: u.layerId,
          kind: u.kind,
          ok: u.ok,
          step: u.step,
          error: u.error ?? null,
        })),
      },
      null,
      2,
    ),
  );

  if (!result.ok) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
