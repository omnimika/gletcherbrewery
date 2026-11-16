#!/usr/bin/env node
/**
 * Logical backup/restore check without pg_dump client tools.
 * Dumps app.* rows to JSON, recreates into a restore DB, verifies counts.
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

const adminSql = postgres(admin, { max: 1 });
const src = postgres(source, { max: 1 });

const tables = [
  "form_submissions",
  "submission_consents",
  "delivery_jobs",
  "delivery_attempts",
  "staff_contact_leads",
];

const dump = {};
for (const t of tables) {
  dump[t] = await src.unsafe(`SELECT * FROM app.${t}`);
}
const publicLeads = await src`SELECT * FROM public.staff_contact_leads`;
console.log(
  "source counts",
  Object.fromEntries(tables.map((t) => [t, dump[t].length])),
  "public.staff_contact_leads",
  publicLeads.length,
);

await adminSql.unsafe(`DROP DATABASE IF EXISTS ${restoreDb}`);
await adminSql.unsafe(`CREATE DATABASE ${restoreDb} OWNER gletcher_migrator`);

const migUrl = source.replace(/\/gletcher_business(\?|$)/, `/${restoreDb}$1`);

await new Promise((resolve, reject) => {
  const child = spawn(process.execPath, [path.join(__dirname, "db-migrate.mjs")], {
    env: { ...process.env, MIGRATION_DATABASE_URL: migUrl },
    stdio: "inherit",
  });
  child.on("exit", (code) =>
    code === 0 ? resolve() : reject(new Error(`migrate exit ${code}`)),
  );
});

const dst = postgres(migUrl, { max: 1 });
for (const row of dump.form_submissions) {
  await dst`
    INSERT INTO app.form_submissions (
      id, form_id, locale, schema_version, source_path, placement,
      idempotency_key, intent_hash, status, fields, created_at
    ) VALUES (
      ${row.id}, ${row.form_id}, ${row.locale}, ${row.schema_version},
      ${row.source_path}, ${row.placement}, ${row.idempotency_key},
      ${row.intent_hash}, ${row.status}, ${row.fields}, ${row.created_at}
    )
  `;
}
for (const row of dump.submission_consents) {
  await dst`
    INSERT INTO app.submission_consents (
      id, submission_id, purpose, legal_basis, policy_version, policy_url,
      captured_at, evidence
    ) VALUES (
      ${row.id}, ${row.submission_id}, ${row.purpose}, ${row.legal_basis},
      ${row.policy_version}, ${row.policy_url}, ${row.captured_at}, ${row.evidence}
    )
  `;
}
for (const row of dump.delivery_jobs) {
  await dst`
    INSERT INTO app.delivery_jobs (
      id, submission_id, destination, event_type, schema_version, status,
      attempts, next_attempt_at, lease_owner, lease_token, lease_expires_at,
      remote_reference, last_error, created_at, updated_at
    ) VALUES (
      ${row.id}, ${row.submission_id}, ${row.destination}, ${row.event_type},
      ${row.schema_version}, ${row.status}, ${row.attempts}, ${row.next_attempt_at},
      ${row.lease_owner}, ${row.lease_token}, ${row.lease_expires_at},
      ${row.remote_reference}, ${row.last_error}, ${row.created_at}, ${row.updated_at}
    )
  `;
}
for (const row of dump.delivery_attempts) {
  await dst`
    INSERT INTO app.delivery_attempts (
      id, job_id, attempt_no, outcome, sanitized_error, remote_reference,
      lease_token, started_at, finished_at
    ) VALUES (
      ${row.id}, ${row.job_id}, ${row.attempt_no}, ${row.outcome},
      ${row.sanitized_error}, ${row.remote_reference}, ${row.lease_token},
      ${row.started_at}, ${row.finished_at}
    )
  `;
}
for (const row of dump.staff_contact_leads) {
  await dst`
    INSERT INTO app.staff_contact_leads (
      submission_id, form_id, locale, source_path, status, created_at,
      name, email, phone, city, company, comment,
      partner_type, inn, tour_date, guests, wishes
    ) VALUES (
      ${row.submission_id}, ${row.form_id}, ${row.locale}, ${row.source_path},
      ${row.status}, ${row.created_at}, ${row.name}, ${row.email}, ${row.phone},
      ${row.city}, ${row.company}, ${row.comment},
      ${row.partner_type ?? null}, ${row.inn ?? null}, ${row.tour_date ?? null},
      ${row.guests ?? null}, ${row.wishes ?? null}
    )
    ON CONFLICT (submission_id) DO NOTHING
  `;
}
for (const row of publicLeads) {
  await dst`
    INSERT INTO public.staff_contact_leads (
      submission_id, form_id, locale, source_path, status, created_at,
      name, email, phone, city, company, comment,
      partner_type, inn, tour_date, guests, wishes
    ) VALUES (
      ${row.submission_id}, ${row.form_id}, ${row.locale}, ${row.source_path},
      ${row.status}, ${row.created_at}, ${row.name}, ${row.email}, ${row.phone},
      ${row.city}, ${row.company}, ${row.comment},
      ${row.partner_type ?? null}, ${row.inn ?? null}, ${row.tour_date ?? null},
      ${row.guests ?? null}, ${row.wishes ?? null}
    )
    ON CONFLICT (submission_id) DO NOTHING
  `;
}

const restored = await dst`SELECT COUNT(*)::int AS c FROM app.form_submissions`;
const restoredPublic = await dst`SELECT COUNT(*)::int AS c FROM public.staff_contact_leads`;
console.log(
  "restored submissions",
  restored[0].c,
  "public.staff_contact_leads",
  restoredPublic[0].c,
);

if (
  restored[0].c !== dump.form_submissions.length ||
  restoredPublic[0].c !== publicLeads.length
) {
  console.error("RESTORE COUNT MISMATCH");
  process.exit(1);
}

await dst.end({ timeout: 2 });
await src.end({ timeout: 2 });
await adminSql.unsafe(`DROP DATABASE ${restoreDb}`);
await adminSql.end({ timeout: 2 });
console.log("RESTORE_CHECK OK", restoreDb);
