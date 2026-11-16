import { closeDb, getDb } from "../src/server/db/client";
import { seedProductReceiptAliases } from "../src/server/loyalty/aliases";

async function main() {
  const db = getDb();
  const result = await seedProductReceiptAliases(db);
  console.log(
    `loyalty aliases: inserted ${result.inserted}, updated ${result.updated} / bootstrap ${result.total}`,
  );
  await closeDb();
}

main().catch(async (err) => {
  console.error(err);
  await closeDb().catch(() => {});
  process.exit(1);
});
