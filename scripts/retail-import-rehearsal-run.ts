/**
 * M1-0 runner (invoked via tsx from retail-import-rehearsal.mjs).
 */
import fs from "node:fs";
import path from "node:path";
import { createDb } from "@/server/db/client";
import { importRetailBatch } from "@/server/retail/import-batch";

async function main() {
  const fileArg = process.argv[2];
  if (!fileArg) {
    console.error(
      "Usage: npm run retail:import-rehearsal -- fixtures/retail/synthetic-batch.geojson",
    );
    process.exit(2);
  }

  const abs = path.resolve(fileArg);
  if (!fs.existsSync(abs)) {
    console.error(`File not found: ${abs}`);
    process.exit(2);
  }

  const text = fs.readFileSync(abs, "utf8");
  const sourceFile = path.basename(abs);
  const sourceLabel = `rehearsal:${sourceFile}`;

  const { db, sql } = createDb();
  try {
    const result = await importRetailBatch(db, {
      sourceLabel,
      sourceFile,
      text,
    });
    console.log(
      JSON.stringify(
        {
          ok: true,
          kind: result.kind,
          batchId: result.batchId,
          checksum: result.checksum,
          report: result.report,
        },
        null,
        2,
      ),
    );
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
