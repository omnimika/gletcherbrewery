-- M1-2: audit log for Mapbox Product publish recipes / gated live runs.
CREATE TABLE IF NOT EXISTS app.retail_tileset_publish_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mode text NOT NULL,
  status text NOT NULL,
  actor text NOT NULL,
  recipe jsonb NOT NULL,
  result jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS retail_tileset_publish_runs_created_idx
  ON app.retail_tileset_publish_runs (created_at DESC);
