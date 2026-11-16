#!/usr/bin/env node
/** Synthetic Contacts RU submit against local API + grant checks. */
import { randomUUID } from "node:crypto";
import postgres from "postgres";

const base = process.env.BASE_URL || "http://127.0.0.1:3000";
const key = randomUUID();

const body = {
  schemaVersion: "contacts-ru-v1",
  formId: "contacts",
  locale: "ru",
  sourcePath: "/contacts",
  placement: "b1_smoke",
  idempotencyKey: key,
  fields: {
    name: "B1 Smoke",
    email: "b1.smoke@example.com",
    phone: "+7 495 000-11-22",
    city: "Клин",
    company: "Synthetic LLC",
    comment: "B1 smoke — synthetic",
  },
  consent: { accepted: true, policyVersion: "policy-ru-v1" },
};

const res = await fetch(`${base}/api/forms/submissions`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});
const json = await res.json();
console.log("HTTP", res.status, json);

if (res.status !== 202 || !json.submissionId) {
  process.exit(1);
}

const dbUrl =
  process.env.DATABASE_URL ||
  "postgres://gletcher_app:gletcher_app_dev@127.0.0.1:5432/gletcher_business";
const sql = postgres(dbUrl, { max: 1 });
const rows = await sql`
  SELECT submission_id, name, email
  FROM public.staff_contact_leads
  WHERE submission_id = ${json.submissionId}::uuid
`;
console.log("public.staff_contact_leads", rows);

const nocodbSql = postgres(
  process.env.NOCODB_DATABASE_URL ||
    "postgres://gletcher_nocodb:gletcher_nocodb_dev@127.0.0.1:5432/gletcher_business",
  { max: 1 },
);
const asNocodb = await nocodbSql`
  SELECT submission_id FROM staff_contact_leads
  WHERE submission_id = ${json.submissionId}::uuid
`;
console.log("nocodb_role_read", asNocodb);

let outboxDenied = false;
try {
  await nocodbSql`SELECT id FROM app.delivery_jobs LIMIT 1`;
} catch {
  outboxDenied = true;
}
console.log("outbox_denied_for_nocodb", outboxDenied);

await sql.end({ timeout: 2 });
await nocodbSql.end({ timeout: 2 });

if (!rows.length || !asNocodb.length || !outboxDenied) {
  console.error("B1 smoke FAILED grant/view checks");
  process.exit(1);
}
console.log("B1 smoke OK", json.submissionId);
