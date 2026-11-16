import { createDb, getWorkerDatabaseUrl } from "../src/server/db/client";
import {
  processDeliveryBatch,
  runDeliveryWorkerLoop,
} from "../src/server/forms/worker";

async function main() {
  const once = process.argv.includes("--once");

  let workerUrl: string;
  try {
    workerUrl = getWorkerDatabaseUrl();
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  }

  const tg = Boolean(
    process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID,
  );
  console.log(
    `[delivery-worker] start once=${once} telegram_configured=${tg} sheets=cancelled_152fz role=gletcher_worker`,
  );

  const { db, sql } = createDb(workerUrl);

  try {
    if (once) {
      let rounds = 0;
      while (rounds < 20) {
        const { processed } = await processDeliveryBatch({ db });
        rounds += 1;
        if (processed === 0) break;
        console.log(`[delivery-worker] batch processed=${processed}`);
      }
    } else {
      await runDeliveryWorkerLoop({ db, intervalMs: 2000 });
    }
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
