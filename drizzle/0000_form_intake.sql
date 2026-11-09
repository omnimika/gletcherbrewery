CREATE SCHEMA IF NOT EXISTS "app";

CREATE TABLE IF NOT EXISTS "app"."form_submissions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "form_id" text NOT NULL,
  "locale" text NOT NULL,
  "schema_version" text NOT NULL,
  "source_path" text NOT NULL,
  "placement" text,
  "idempotency_key" text NOT NULL,
  "intent_hash" text NOT NULL,
  "status" text DEFAULT 'accepted' NOT NULL,
  "fields" jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "form_submissions_idempotency_uidx"
  ON "app"."form_submissions" ("form_id","locale","idempotency_key");
CREATE INDEX IF NOT EXISTS "form_submissions_created_idx"
  ON "app"."form_submissions" ("created_at");
CREATE INDEX IF NOT EXISTS "form_submissions_form_idx"
  ON "app"."form_submissions" ("form_id");

CREATE TABLE IF NOT EXISTS "app"."submission_consents" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "submission_id" uuid NOT NULL,
  "purpose" text NOT NULL,
  "legal_basis" text NOT NULL,
  "policy_version" text NOT NULL,
  "policy_url" text NOT NULL,
  "captured_at" timestamp with time zone DEFAULT now() NOT NULL,
  "evidence" jsonb NOT NULL,
  CONSTRAINT "submission_consents_submission_id_form_submissions_id_fk"
    FOREIGN KEY ("submission_id") REFERENCES "app"."form_submissions"("id")
    ON DELETE cascade ON UPDATE no action
);

CREATE INDEX IF NOT EXISTS "submission_consents_submission_idx"
  ON "app"."submission_consents" ("submission_id");

CREATE TABLE IF NOT EXISTS "app"."delivery_jobs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "submission_id" uuid NOT NULL,
  "destination" text NOT NULL,
  "event_type" text DEFAULT 'submission_accepted' NOT NULL,
  "schema_version" text DEFAULT '1' NOT NULL,
  "status" text DEFAULT 'pending' NOT NULL,
  "attempts" integer DEFAULT 0 NOT NULL,
  "next_attempt_at" timestamp with time zone DEFAULT now() NOT NULL,
  "lease_owner" text,
  "lease_token" text,
  "lease_expires_at" timestamp with time zone,
  "remote_reference" text,
  "last_error" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "delivery_jobs_submission_id_form_submissions_id_fk"
    FOREIGN KEY ("submission_id") REFERENCES "app"."form_submissions"("id")
    ON DELETE cascade ON UPDATE no action
);

CREATE UNIQUE INDEX IF NOT EXISTS "delivery_jobs_unique_uidx"
  ON "app"."delivery_jobs" ("submission_id","destination","event_type","schema_version");
CREATE INDEX IF NOT EXISTS "delivery_jobs_status_next_idx"
  ON "app"."delivery_jobs" ("status","next_attempt_at");

CREATE TABLE IF NOT EXISTS "app"."delivery_attempts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "job_id" uuid NOT NULL,
  "attempt_no" integer NOT NULL,
  "outcome" text NOT NULL,
  "sanitized_error" text,
  "remote_reference" text,
  "lease_token" text,
  "started_at" timestamp with time zone DEFAULT now() NOT NULL,
  "finished_at" timestamp with time zone,
  CONSTRAINT "delivery_attempts_job_id_delivery_jobs_id_fk"
    FOREIGN KEY ("job_id") REFERENCES "app"."delivery_jobs"("id")
    ON DELETE cascade ON UPDATE no action
);

CREATE INDEX IF NOT EXISTS "delivery_attempts_job_idx"
  ON "app"."delivery_attempts" ("job_id");

-- Staff CRM projection: no outbox/consent internals, limited PII columns.
CREATE OR REPLACE VIEW "app"."staff_contact_leads" AS
SELECT
  s.id AS submission_id,
  s.form_id,
  s.locale,
  s.source_path,
  s.status,
  s.created_at,
  s.fields ->> 'name' AS name,
  s.fields ->> 'email' AS email,
  s.fields ->> 'phone' AS phone,
  s.fields ->> 'city' AS city,
  s.fields ->> 'company' AS company,
  s.fields ->> 'comment' AS comment
FROM "app"."form_submissions" s
WHERE s.form_id = 'contacts';

REVOKE ALL ON TABLE "app"."form_submissions" FROM PUBLIC;
REVOKE ALL ON TABLE "app"."submission_consents" FROM PUBLIC;
REVOKE ALL ON TABLE "app"."delivery_jobs" FROM PUBLIC;
REVOKE ALL ON TABLE "app"."delivery_attempts" FROM PUBLIC;
REVOKE ALL ON TABLE "app"."staff_contact_leads" FROM PUBLIC;

GRANT SELECT, INSERT, UPDATE ON TABLE "app"."form_submissions" TO gletcher_app;
GRANT SELECT, INSERT, UPDATE ON TABLE "app"."submission_consents" TO gletcher_app;
GRANT SELECT, INSERT, UPDATE ON TABLE "app"."delivery_jobs" TO gletcher_app;
GRANT SELECT, INSERT ON TABLE "app"."delivery_attempts" TO gletcher_app;

GRANT SELECT, INSERT, UPDATE ON TABLE "app"."delivery_jobs" TO gletcher_worker;
GRANT SELECT, INSERT, UPDATE ON TABLE "app"."delivery_attempts" TO gletcher_worker;
GRANT SELECT ON TABLE "app"."form_submissions" TO gletcher_worker;

-- NocoDB staff: view only — no base table / outbox access
REVOKE ALL ON TABLE "app"."form_submissions" FROM gletcher_nocodb;
REVOKE ALL ON TABLE "app"."submission_consents" FROM gletcher_nocodb;
REVOKE ALL ON TABLE "app"."delivery_jobs" FROM gletcher_nocodb;
REVOKE ALL ON TABLE "app"."delivery_attempts" FROM gletcher_nocodb;
GRANT SELECT ON TABLE "app"."staff_contact_leads" TO gletcher_nocodb;
