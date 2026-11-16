import { createDb, closeDb } from "../src/server/db/client";
import {
  processDeliveryBatch,
  runDeliveryWorkerLoop,
} from "../src/server/forms/worker";

async function main() {
  const once = process.argv.includes("--once");

  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }

  const tg = Boolean(
    process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID,
  );
  console.log(
    `[delivery-worker] start once=${once} telegram_configured=${tg} sheets=cancelled_152fz`,
  );

  const { db } = createDb();

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
    await closeDb();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
