#!/usr/bin/env node
/**
 * Logical backup/restore check for current app schema (not B1-only).
 * Dumps app.* (+ public.staff_contact_leads), migrates empty DB, restores rows,
 * cancels deliverable outbox jobs, verifies counts.
 * Private receipt files are skipped (local-only / Object Storage = later).
 */
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = process.env.PGPORT || "54329";
const admin =
  process.env.PG_ADMIN_URL ||
  `postgres://postgres:postgres_dev@127.0.0.1:${port}/postgres`;
const source =
  process.env.MIGRATION_DATABASE_URL ||
  `postgres://gletcher_migrator:gletcher_migrator_dev@127.0.0.1:${port}/gletcher_business`;

const stamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
const restoreDb = `gletcher_business_restore_${stamp}`;

/** Preferential insert order (FK-friendly). Unknown tables appended alphabetically. */
const PREFERRED_ORDER = [
  "form_submissions",
  "submission_consents",
  "delivery_jobs",
  "delivery_attempts",
  "staff_contact_leads",
  "staff_lead_events",
  "retail_import_batches",
  "retail_staging_rows",
  "retail_chains",
  "retail_chain_products",
  "retail_assortment_events",
  "retail_locations",
  "retail_location_products",
  "retail_tileset_publish_runs",
  "loyalty_members",
  "loyalty_receipts",
  "loyalty_ledger_entries",
  "product_receipt_aliases",
  "loyalty_agent_applications",
  "loyalty_agent_application_events",
  "loyalty_magic_link_tokens",
  "loyalty_member_sessions",
];

function quoteIdent(name) {
  return `"${String(name).replaceAll('"', '""')}"`;
}

async function listAppTables(sql) {
  const rows = await sql`
    SELECT c.relname AS t
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'app'
      AND c.relkind = 'r'
      AND c.relname <> 'schema_migrations'
    ORDER BY 1
  `;
  return rows.map((r) => r.t);
}

function orderTables(tables) {
  const set = new Set(tables);
  const ordered = [];
  for (const t of PREFERRED_ORDER) {
    if (set.has(t)) {
      ordered.push(t);
      set.delete(t);
    }
  }
  for (const t of [...set].sort()) ordered.push(t);
  return ordered;
}

async function insertRow(sql, schema, table, row) {
  const cols = Object.keys(row);
  if (!cols.length) return;
  const colList = cols.map(quoteIdent).join(", ");
  const params = cols.map((_, i) => `$${i + 1}`);
  const values = cols.map((c) => row[c]);
  await sql.unsafe(
    `INSERT INTO ${quoteIdent(schema)}.${quoteIdent(table)} (${colList}) VALUES (${params.join(", ")})`,
    values,
  );
}

async function restoreTableMultiPass(sql, schema, table, rows, maxPasses = 8) {
  let pending = [...rows];
  let pass = 0;
  const errors = [];
  while (pending.length && pass < maxPasses) {
    pass += 1;
    const next = [];
    for (const row of pending) {
      try {
        await insertRow(sql, schema, table, row);
      } catch (err) {
        next.push(row);
        if (pass === maxPasses) {
          errors.push(err instanceof Error ? err.message : String(err));
        }
      }
    }
    if (next.length === pending.length && pass > 1) {
      // No progress
      break;
    }
    pending = next;
  }
  if (pending.length) {
    throw new Error(
      `restore ${schema}.${table}: ${pending.length} rows failed after ${pass} passes; last=${errors[0] ?? "unknown"}`,
    );
  }
}

const adminSql = postgres(admin, { max: 1, prepare: false });
const src = postgres(source, { max: 1, prepare: false });

try {
  const appTables = orderTables(await listAppTables(src));
  const dump = {};
  for (const t of appTables) {
    // Table names come from pg_catalog (app schema only).
    dump[t] = await src.unsafe(`SELECT * FROM app.${t}`);
  }

  let publicLeads = [];
  try {
    publicLeads = await src`SELECT * FROM public.staff_contact_leads`;
  } catch {
    publicLeads = [];
  }

  console.log(
    "source counts",
    Object.fromEntries(appTables.map((t) => [t, dump[t].length])),
    "public.staff_contact_leads",
    publicLeads.length,
  );
  console.log("files=skipped_local_only");

  await adminSql.unsafe(`DROP DATABASE IF EXISTS ${restoreDb}`);
  await adminSql.unsafe(`CREATE DATABASE ${restoreDb} OWNER gletcher_migrator`);

  const migUrl = source.replace(/\/gletcher_business(\?|$)/, `/${restoreDb}$1`);

  await new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [path.join(__dirname, "db-migrate.mjs")],
      {
        env: { ...process.env, MIGRATION_DATABASE_URL: migUrl },
        stdio: "inherit",
      },
    );
    child.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`migrate exit ${code}`)),
    );
  });

  const dst = postgres(migUrl, { max: 1, prepare: false });
  try {
    for (const t of appTables) {
      if (!dump[t].length) continue;
      console.log(`restore app.${t} rows=${dump[t].length}`);
      await restoreTableMultiPass(dst, "app", t, dump[t]);
    }

    if (publicLeads.length) {
      console.log(`restore public.staff_contact_leads rows=${publicLeads.length}`);
      for (const row of publicLeads) {
        try {
          await insertRow(dst, "public", "staff_contact_leads", row);
        } catch (err) {
          // Mirror may already be filled by app insert triggers / earlier copy
          const msg = err instanceof Error ? err.message : String(err);
          if (!/duplicate|unique/i.test(msg)) throw err;
        }
      }
    }

    const cancelled = await dst`
      UPDATE app.delivery_jobs
      SET
        status = 'cancelled_policy',
        last_error = 'restore_rehearsal_no_deliver',
        lease_owner = NULL,
        lease_token = NULL,
        lease_expires_at = NULL,
        updated_at = now()
      WHERE status IN ('pending', 'retry', 'leased')
      RETURNING id
    `;
    console.log("cancelled_deliverable_jobs", cancelled.length);

    const mismatches = [];
    for (const t of appTables) {
      const [{ c }] = await dst.unsafe(
        `SELECT COUNT(*)::int AS c FROM app.${t}`,
      );
      if (c !== dump[t].length) {
        mismatches.push(`${t}: source=${dump[t].length} restore=${c}`);
      }
    }
    const [{ c: pubC }] = await dst`
      SELECT COUNT(*)::int AS c FROM public.staff_contact_leads
    `;
    if (pubC !== publicLeads.length && publicLeads.length > 0) {
      // Allow restore >= source if app rows already projected
      if (pubC < publicLeads.length) {
        mismatches.push(
          `public.staff_contact_leads: source=${publicLeads.length} restore=${pubC}`,
        );
      }
    }

    // Sample relationship: ledger members exist
    const orphans = await dst`
      SELECT COUNT(*)::int AS c
      FROM app.loyalty_ledger_entries e
      LEFT JOIN app.loyalty_members m ON m.id = e.member_id
      WHERE m.id IS NULL
    `;
    if (orphans[0].c > 0) {
      mismatches.push(`loyalty_ledger orphan members=${orphans[0].c}`);
    }

    const stillDeliverable = await dst`
      SELECT COUNT(*)::int AS c
      FROM app.delivery_jobs
      WHERE status IN ('pending', 'retry', 'leased')
    `;
    if (stillDeliverable[0].c > 0) {
      mismatches.push(
        `deliverable jobs remain=${stillDeliverable[0].c}`,
      );
    }

    if (mismatches.length) {
      console.error("RESTORE CHECK FAILED", mismatches);
      process.exitCode = 1;
    } else {
      console.log("RESTORE_CHECK OK", restoreDb, {
        tables: appTables.length,
        cancelledJobs: cancelled.length,
      });
    }
  } finally {
    await dst.end({ timeout: 2 }).catch(() => {});
  }
} finally {
  await src.end({ timeout: 2 }).catch(() => {});
  try {
    await adminSql.unsafe(`DROP DATABASE IF EXISTS ${restoreDb}`);
  } catch {
    /* ignore */
  }
  await adminSql.end({ timeout: 2 }).catch(() => {});
}
