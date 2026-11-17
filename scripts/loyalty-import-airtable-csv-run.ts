/**
 * Protected Airtable CSV import runner — summary only, no PII in stdout.
 */
import path from "node:path";
import { createDb } from "@/server/db/client";
import { loadAirtableCsvDir } from "@/server/loyalty/import/csv-airtable";
import { importLoyaltyBatch } from "@/server/loyalty/import/import-batch";
import { reconcileLoyaltyImport } from "@/server/loyalty/import/reconcile";
import type { ImportMode } from "@/server/loyalty/import";

async function main() {
  const dirArg = process.argv[2];
  if (!dirArg) {
    console.error(
      "Usage: npm run loyalty:import-airtable-csv -- tmp/Airtable [--mode=dry_run|apply]",
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
  const cutoffAt = new Date();
  const loaded = loadAirtableCsvDir(abs, {
    cutoffAt,
    sourceLabel: `airtable-csv-${cutoffAt.toISOString().slice(0, 10)}`,
  });

  const migratorUrl =
    process.env.MIGRATION_DATABASE_URL || process.env.DATABASE_URL;
  const { db, sql } = createDb();
  const migrator = createDb(migratorUrl!);
  try {
    // Local rehearsal: wipe loyalty domain so leftovers don't skew reconcile.
    // Requires MIGRATION_DATABASE_URL (app cannot DELETE ledger). Owner-approved.
    if (mode === "apply" || process.env.LOYALTY_IMPORT_CLEAN === "1") {
      await migrator.sql`DELETE FROM app.loyalty_agent_application_events`;
      await migrator.sql`DELETE FROM app.loyalty_agent_applications`;
      await migrator.sql`DELETE FROM app.loyalty_ledger_entries`;
      await migrator.sql`DELETE FROM app.loyalty_receipts`;
      await migrator.sql`DELETE FROM app.loyalty_member_sessions`;
      await migrator.sql`DELETE FROM app.loyalty_magic_link_tokens`;
      await migrator.sql`DELETE FROM app.loyalty_import_identity_map`;
      await migrator.sql`DELETE FROM app.loyalty_staging_rows`;
      await migrator.sql`DELETE FROM app.loyalty_import_batches`;
      await migrator.sql`DELETE FROM app.loyalty_members`;
    }

    const result = await importLoyaltyBatch(db, {
      manifest: loaded.manifest,
      files: loaded.files,
      mode,
    });

    let reconcile = null;
    if (mode === "apply") {
      reconcile = await reconcileLoyaltyImport(db, {
        batchId: result.batchId,
        manifest: loaded.manifest,
        sourceTargets: {
          members: loaded.sourceTargets.members,
          uniqueEmails: loaded.sourceTargets.uniqueEmails,
          sumAvailable: loaded.sourceTargets.sumAvailable,
          sumLifetime: loaded.sourceTargets.sumLifetime,
          checkEarnGap: loaded.sourceTargets.checkEarnGap,
          byEmail: loaded.sourceTargets.byEmail,
        },
        omitMemberRows: true,
      });
    }

    console.log(
      JSON.stringify(
        {
          ok: mode === "dry_run" ? true : Boolean(reconcile?.ok),
          mode,
          warnings: loaded.warnings,
          sourceTargets: {
            members: loaded.sourceTargets.members,
            uniqueEmails: loaded.sourceTargets.uniqueEmails,
            duplicateEmailRows: loaded.sourceTargets.duplicateEmailRows,
            sumAvailable: loaded.sourceTargets.sumAvailable,
            sumLifetime: loaded.sourceTargets.sumLifetime,
            sumCheckEarnRollup: loaded.sourceTargets.sumCheckEarnRollup,
            checksInFile: loaded.sourceTargets.checksInFile,
            sumCheckEarnInFile: loaded.sourceTargets.sumCheckEarnInFile,
            checkEarnGap: loaded.sourceTargets.checkEarnGap,
            agents: loaded.sourceTargets.agents,
            orders: loaded.sourceTargets.orders,
          },
          policy: loaded.manifest.policy.legacyEligibility,
          import: {
            batchId: result.batchId,
            checksum: result.checksum,
            kind: result.kind,
            status: result.status,
            rowCount: result.rowCount,
            quarantineCount: result.quarantineCount,
            byTable: result.byTable,
            applied: result.applied,
            quarantineCodes: summarizeCodes(result.quarantines),
          },
          reconcile: reconcile
            ? {
                ok: reconcile.ok,
                aggregates: reconcile.aggregates,
                sourceTargetDiff: reconcile.sourceTargetDiff,
                anomalies: reconcile.anomalies,
                expectationDiffCount: reconcile.expectationDiffs.length,
              }
            : null,
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
    await migrator.sql.end({ timeout: 5 });
  }
}

function summarizeCodes(
  quarantines: Array<{ codes: string[] }>,
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const q of quarantines) {
    for (const c of q.codes) {
      out[c] = (out[c] ?? 0) + 1;
    }
  }
  return out;
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
