import path from "node:path";
import { fileURLToPath } from "node:url";
import { getDb } from "../src/server/db/client";
import { importLocationsFromSources } from "../src/server/retail/import-locations";

const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

async function main() {
  const result = await importLocationsFromSources(getDb(), {
    repoRoot,
    actor: "cli:retail-import-locations",
  });
  console.log(JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
