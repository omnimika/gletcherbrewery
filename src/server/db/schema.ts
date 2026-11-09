import {
  index,
  jsonb,
  pgSchema,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  integer,
} from "drizzle-orm/pg-core";

/** Application-owned business schema (not NocoDB metadata). */
export const appSchema = pgSchema("app");

export const formSubmissions = appSchema.table(
  "form_submissions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    formId: text("form_id").notNull(),
    locale: text("locale").notNull(),
    schemaVersion: text("schema_version").notNull(),
    sourcePath: text("source_path").notNull(),
    placement: text("placement"),
    idempotencyKey: text("idempotency_key").notNull(),
    intentHash: text("intent_hash").notNull(),
    status: text("status").notNull().default("accepted"),
    fields: jsonb("fields").notNull().$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("form_submissions_idempotency_uidx").on(
      t.formId,
      t.locale,
      t.idempotencyKey,
    ),
    index("form_submissions_created_idx").on(t.createdAt),
    index("form_submissions_form_idx").on(t.formId),
  ],
);

export const submissionConsents = appSchema.table(
  "submission_consents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    submissionId: uuid("submission_id")
      .notNull()
      .references(() => formSubmissions.id, { onDelete: "cascade" }),
    purpose: text("purpose").notNull(),
    legalBasis: text("legal_basis").notNull(),
    policyVersion: text("policy_version").notNull(),
    policyUrl: text("policy_url").notNull(),
    capturedAt: timestamp("captured_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    evidence: jsonb("evidence").notNull().$type<Record<string, unknown>>(),
  },
  (t) => [index("submission_consents_submission_idx").on(t.submissionId)],
);

export const deliveryJobs = appSchema.table(
  "delivery_jobs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    submissionId: uuid("submission_id")
      .notNull()
      .references(() => formSubmissions.id, { onDelete: "cascade" }),
    destination: text("destination").notNull(),
    eventType: text("event_type").notNull().default("submission_accepted"),
    schemaVersion: text("schema_version").notNull().default("1"),
    status: text("status").notNull().default("pending"),
    attempts: integer("attempts").notNull().default(0),
    nextAttemptAt: timestamp("next_attempt_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    leaseOwner: text("lease_owner"),
    leaseToken: text("lease_token"),
    leaseExpiresAt: timestamp("lease_expires_at", { withTimezone: true }),
    remoteReference: text("remote_reference"),
    lastError: text("last_error"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("delivery_jobs_unique_uidx").on(
      t.submissionId,
      t.destination,
      t.eventType,
      t.schemaVersion,
    ),
    index("delivery_jobs_status_next_idx").on(t.status, t.nextAttemptAt),
  ],
);

/** Staff CRM projection — SELECT-only for NocoDB role. */
export const staffContactLeads = appSchema.table(
  "staff_contact_leads",
  {
    submissionId: uuid("submission_id")
      .primaryKey()
      .references(() => formSubmissions.id, { onDelete: "cascade" }),
    formId: text("form_id").notNull(),
    locale: text("locale").notNull(),
    sourcePath: text("source_path").notNull(),
    status: text("status").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    name: text("name"),
    email: text("email"),
    phone: text("phone"),
    city: text("city"),
    company: text("company"),
    comment: text("comment"),
    partnerType: text("partner_type"),
    inn: text("inn"),
    tourDate: text("tour_date"),
    guests: text("guests"),
    wishes: text("wishes"),
    /** Staff triage — separate from intake `status` (accepted). */
    workflowStatus: text("workflow_status").notNull().default("new"),
    assignee: text("assignee"),
    staffNote: text("staff_note"),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    updatedBy: text("updated_by"),
  },
  (t) => [
    index("staff_contact_leads_created_idx").on(t.createdAt),
    index("staff_contact_leads_workflow_idx").on(t.workflowStatus, t.createdAt),
  ],
);

/** Append-only staff audit trail (not editable via NocoDB). */
export const staffLeadEvents = appSchema.table(
  "staff_lead_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    submissionId: uuid("submission_id")
      .notNull()
      .references(() => formSubmissions.id, { onDelete: "cascade" }),
    action: text("action").notNull(),
    actor: text("actor").notNull(),
    payload: jsonb("payload").notNull().$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("staff_lead_events_submission_idx").on(t.submissionId, t.createdAt),
  ],
);

export const deliveryAttempts = appSchema.table(
  "delivery_attempts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    jobId: uuid("job_id")
      .notNull()
      .references(() => deliveryJobs.id, { onDelete: "cascade" }),
    attemptNo: integer("attempt_no").notNull(),
    outcome: text("outcome").notNull(),
    sanitizedError: text("sanitized_error"),
    remoteReference: text("remote_reference"),
    leaseToken: text("lease_token"),
    startedAt: timestamp("started_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
  },
  (t) => [index("delivery_attempts_job_idx").on(t.jobId)],
);
