-- Replace staff view with a physical projection table so NocoDB can sync it.
-- Still SELECT-only for gletcher_nocodb; written only by app role in intake txn.

DROP VIEW IF EXISTS "app"."staff_contact_leads";

CREATE TABLE IF NOT EXISTS "app"."staff_contact_leads" (
  "submission_id" uuid PRIMARY KEY,
  "form_id" text NOT NULL,
  "locale" text NOT NULL,
  "source_path" text NOT NULL,
  "status" text NOT NULL,
  "created_at" timestamp with time zone NOT NULL,
  "name" text,
  "email" text,
  "phone" text,
  "city" text,
  "company" text,
  "comment" text,
  CONSTRAINT "staff_contact_leads_submission_id_fk"
    FOREIGN KEY ("submission_id") REFERENCES "app"."form_submissions"("id")
    ON DELETE cascade ON UPDATE no action
);

CREATE INDEX IF NOT EXISTS "staff_contact_leads_created_idx"
  ON "app"."staff_contact_leads" ("created_at");

-- Backfill existing synthetic rows
INSERT INTO "app"."staff_contact_leads" (
  submission_id, form_id, locale, source_path, status, created_at,
  name, email, phone, city, company, comment
)
SELECT
  s.id, s.form_id, s.locale, s.source_path, s.status, s.created_at,
  s.fields ->> 'name',
  s.fields ->> 'email',
  s.fields ->> 'phone',
  s.fields ->> 'city',
  s.fields ->> 'company',
  s.fields ->> 'comment'
FROM "app"."form_submissions" s
WHERE s.form_id = 'contacts'
ON CONFLICT (submission_id) DO NOTHING;

GRANT SELECT, INSERT, UPDATE ON TABLE "app"."staff_contact_leads" TO gletcher_app;
REVOKE ALL ON TABLE "app"."staff_contact_leads" FROM gletcher_nocodb;
GRANT SELECT ON TABLE "app"."staff_contact_leads" TO gletcher_nocodb;
REVOKE ALL ON TABLE "app"."form_submissions" FROM gletcher_nocodb;
REVOKE ALL ON TABLE "app"."submission_consents" FROM gletcher_nocodb;
REVOKE ALL ON TABLE "app"."delivery_jobs" FROM gletcher_nocodb;
REVOKE ALL ON TABLE "app"."delivery_attempts" FROM gletcher_nocodb;
