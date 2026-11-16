-- M1-0: retail import staging (rehearsal). No production Mapbox publish.

CREATE TABLE IF NOT EXISTS app.retail_import_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_kind text NOT NULL,
  source_label text NOT NULL,
  checksum text NOT NULL,
  row_count integer NOT NULL DEFAULT 0,
  anomaly_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'loaded',
  report jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT retail_import_batches_checksum_uidx UNIQUE (checksum, source_label)
);

CREATE TABLE IF NOT EXISTS app.retail_staging_rows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL
    REFERENCES app.retail_import_batches (id) ON DELETE CASCADE,
  source_file text NOT NULL,
  source_row_number integer NOT NULL,
  raw_json jsonb NOT NULL,
  type text,
  title text,
  city text,
  adress text,
  product text,
  packing text,
  longitude double precision,
  latitude double precision,
  anomaly_codes text[] NOT NULL DEFAULT '{}',
  quarantine_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT retail_staging_rows_source_uidx
    UNIQUE (batch_id, source_file, source_row_number)
);

CREATE INDEX IF NOT EXISTS retail_staging_rows_batch_idx
  ON app.retail_staging_rows (batch_id);
CREATE INDEX IF NOT EXISTS retail_staging_rows_anomalies_idx
  ON app.retail_staging_rows USING gin (anomaly_codes);
CREATE INDEX IF NOT EXISTS retail_staging_rows_title_adress_idx
  ON app.retail_staging_rows (title, adress);

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE app.retail_import_batches TO gletcher_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE app.retail_staging_rows TO gletcher_app;
GRANT SELECT ON TABLE app.retail_import_batches TO gletcher_nocodb;
GRANT SELECT ON TABLE app.retail_staging_rows TO gletcher_nocodb;
REVOKE ALL ON TABLE app.retail_import_batches FROM PUBLIC;
REVOKE ALL ON TABLE app.retail_staging_rows FROM PUBLIC;
REVOKE ALL ON TABLE app.retail_import_batches FROM gletcher_worker;
REVOKE ALL ON TABLE app.retail_staging_rows FROM gletcher_worker;
