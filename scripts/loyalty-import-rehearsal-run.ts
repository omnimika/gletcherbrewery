/**
 * M2-4 foundation runner (invoked via tsx from loyalty-import-rehearsal.mjs).
 */
import path from "node:path";
import { createDb } from "@/server/db/client";
import {
  importLoyaltyBatch,
  loadLoyaltyFixtureDir,
  reconcileLoyaltyImport,
} from "@/server/loyalty/import";
import type { ImportMode } from "@/server/loyalty/import";

async function main() {
  const dirArg = process.argv[2];
  if (!dirArg) {
    console.error(
      "Usage: npm run loyalty:import-rehearsal -- fixtures/loyalty/m2-4-linked [--mode=dry_run|apply]",
    );
    process.exit(2);
  }

  let mode: ImportMode = "dry_run";
  for (const a of process.argv.slice(3)) {
    if (a.startsWith("--mode=")) {
      const v = a.slice("--mode=".length);
      if (v === "apply" || v === "dry_run") mode = v;
      else {
        console.error(`Unknown mode: ${v}`);
        process.exit(2);
      }
    }
  }

  const abs = path.resolve(dirArg);
  const { manifest, files } = loadLoyaltyFixtureDir(abs);
  const { db, sql } = createDb();

  try {
    const result = await importLoyaltyBatch(db, { manifest, files, mode });
    let reconcile = null;
    if (mode === "apply") {
      reconcile = await reconcileLoyaltyImport(db, {
        batchId: result.batchId,
        manifest,
      });
    }
    console.log(
      JSON.stringify(
        {
          ok: mode === "dry_run" ? true : Boolean(reconcile?.ok),
          mode,
          import: result,
          reconcile,
        },
        null,
        2,
      ),
    );
    if (mode === "apply" && reconcile && !reconcile.ok) {
      process.exit(1);
    }
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
