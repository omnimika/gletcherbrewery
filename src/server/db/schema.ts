import {
  boolean,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgSchema,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
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

/** M1 retail import staging — source rows before CRM publish. */
export const retailImportBatches = appSchema.table(
  "retail_import_batches",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sourceKind: text("source_kind").notNull(),
    sourceLabel: text("source_label").notNull(),
    checksum: text("checksum").notNull(),
    rowCount: integer("row_count").notNull().default(0),
    anomalyCount: integer("anomaly_count").notNull().default(0),
    status: text("status").notNull().default("loaded"),
    report: jsonb("report").notNull().$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("retail_import_batches_checksum_uidx").on(
      t.checksum,
      t.sourceLabel,
    ),
  ],
);

export const retailStagingRows = appSchema.table(
  "retail_staging_rows",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    batchId: uuid("batch_id")
      .notNull()
      .references(() => retailImportBatches.id, { onDelete: "cascade" }),
    sourceFile: text("source_file").notNull(),
    sourceRowNumber: integer("source_row_number").notNull(),
    rawJson: jsonb("raw_json").notNull().$type<Record<string, unknown>>(),
    type: text("type"),
    title: text("title"),
    city: text("city"),
    adress: text("adress"),
    product: text("product"),
    packing: text("packing"),
    longitude: doublePrecision("longitude"),
    latitude: doublePrecision("latitude"),
    anomalyCodes: text("anomaly_codes").array().notNull().default([]),
    quarantineReason: text("quarantine_reason"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("retail_staging_rows_source_uidx").on(
      t.batchId,
      t.sourceFile,
      t.sourceRowNumber,
    ),
    index("retail_staging_rows_batch_idx").on(t.batchId),
    index("retail_staging_rows_title_adress_idx").on(t.title, t.adress),
  ],
);

/** Chain-level assortment (Sheet «Карта» matrix). */
export const retailChains = appSchema.table("retail_chains", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  legalName: text("legal_name"),
  mapUrl: text("map_url"),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
  updatedBy: text("updated_by"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const retailChainProducts = appSchema.table(
  "retail_chain_products",
  {
    chainId: uuid("chain_id")
      .notNull()
      .references(() => retailChains.id, { onDelete: "cascade" }),
    productSlug: text("product_slug").notNull(),
    available: boolean("available").notNull().default(false),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    updatedBy: text("updated_by"),
  },
  (t) => [
    primaryKey({ columns: [t.chainId, t.productSlug] }),
    index("retail_chain_products_slug_idx").on(t.productSlug),
  ],
);

export const retailAssortmentEvents = appSchema.table(
  "retail_assortment_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    chainId: uuid("chain_id")
      .notNull()
      .references(() => retailChains.id, { onDelete: "cascade" }),
    productSlug: text("product_slug").notNull(),
    action: text("action").notNull(),
    actor: text("actor").notNull(),
    payload: jsonb("payload").notNull().$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("retail_assortment_events_chain_idx").on(t.chainId, t.createdAt),
  ],
);

/** Controlled Mapbox Product publish attempts (dry-run or gated live). */
export const retailTilesetPublishRuns = appSchema.table(
  "retail_tileset_publish_runs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    mode: text("mode").notNull(),
    status: text("status").notNull(),
    actor: text("actor").notNull(),
    recipe: jsonb("recipe").notNull().$type<Record<string, unknown>>(),
    result: jsonb("result").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("retail_tileset_publish_runs_created_idx").on(t.createdAt)],
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
