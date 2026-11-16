import fs from "node:fs";
import path from "node:path";
import { createDb } from "@/server/db/client";
import { seedAssortmentFromCsv } from "@/server/retail/seed-assortment";

async function main() {
  const fileArg =
    process.argv[2] ?? "fixtures/retail/chain-assortment.csv";
  const abs = path.resolve(fileArg);
  if (!fs.existsSync(abs)) {
    console.error(`File not found: ${abs}`);
    process.exit(2);
  }
  const text = fs.readFileSync(abs, "utf8");
  const { db, sql } = createDb();
  try {
    const result = await seedAssortmentFromCsv(db, text, "csv-seed");
    console.log(JSON.stringify({ ok: true, ...result }, null, 2));
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
