-- M2-4 foundation: loyalty Airtable import staging + identity map.
-- Synthetic path only; production snapshot is a separate owner operation.

CREATE TABLE IF NOT EXISTS app.loyalty_import_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_label text NOT NULL,
  checksum text NOT NULL,
  policy_version text NOT NULL,
  mapping_version text NOT NULL,
  status text NOT NULL DEFAULT 'loaded',
  manifest jsonb NOT NULL DEFAULT '{}'::jsonb,
  report jsonb NOT NULL DEFAULT '{}'::jsonb,
  row_count integer NOT NULL DEFAULT 0,
  quarantine_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz,
  CONSTRAINT loyalty_import_batches_checksum_uidx UNIQUE (checksum, source_label)
);

CREATE TABLE IF NOT EXISTS app.loyalty_staging_rows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL
    REFERENCES app.loyalty_import_batches (id) ON DELETE CASCADE,
  source_table_id text NOT NULL,
  source_record_id text NOT NULL,
  source_file text NOT NULL,
  raw_json jsonb NOT NULL,
  parse_status text NOT NULL DEFAULT 'ok',
  anomaly_codes text[] NOT NULL DEFAULT '{}',
  quarantine_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT loyalty_staging_rows_source_uidx
    UNIQUE (batch_id, source_table_id, source_record_id)
);

CREATE INDEX IF NOT EXISTS loyalty_staging_rows_batch_idx
  ON app.loyalty_staging_rows (batch_id);
CREATE INDEX IF NOT EXISTS loyalty_staging_rows_table_idx
  ON app.loyalty_staging_rows (batch_id, source_table_id);
CREATE INDEX IF NOT EXISTS loyalty_staging_rows_anomalies_idx
  ON app.loyalty_staging_rows USING gin (anomaly_codes);

CREATE TABLE IF NOT EXISTS app.loyalty_import_identity_map (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL
    REFERENCES app.loyalty_import_batches (id) ON DELETE CASCADE,
  source_system text NOT NULL DEFAULT 'airtable',
  table_id text NOT NULL,
  record_id text NOT NULL,
  entity_kind text NOT NULL,
  target_uuid uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT loyalty_import_identity_source_uidx
    UNIQUE (source_system, table_id, record_id)
);

CREATE INDEX IF NOT EXISTS loyalty_import_identity_batch_idx
  ON app.loyalty_import_identity_map (batch_id);
CREATE INDEX IF NOT EXISTS loyalty_import_identity_target_idx
  ON app.loyalty_import_identity_map (target_uuid);

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE app.loyalty_import_batches TO gletcher_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE app.loyalty_staging_rows TO gletcher_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE app.loyalty_import_identity_map TO gletcher_app;
GRANT SELECT ON TABLE app.loyalty_import_batches TO gletcher_nocodb;
GRANT SELECT ON TABLE app.loyalty_staging_rows TO gletcher_nocodb;
GRANT SELECT ON TABLE app.loyalty_import_identity_map TO gletcher_nocodb;
REVOKE ALL ON TABLE app.loyalty_import_batches FROM PUBLIC;
REVOKE ALL ON TABLE app.loyalty_staging_rows FROM PUBLIC;
REVOKE ALL ON TABLE app.loyalty_import_identity_map FROM PUBLIC;
REVOKE ALL ON TABLE app.loyalty_import_batches FROM gletcher_worker;
REVOKE ALL ON TABLE app.loyalty_staging_rows FROM gletcher_worker;
REVOKE ALL ON TABLE app.loyalty_import_identity_map FROM gletcher_worker;
