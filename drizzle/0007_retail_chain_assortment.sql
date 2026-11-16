-- M1-1: chain × SKU assortment matrix (Sheet «Карта» analogue).
-- No Mapbox tileset publish in this migration.

CREATE TABLE IF NOT EXISTS app.retail_chains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  legal_name text,
  map_url text,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  updated_at timestamptz,
  updated_by text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app.retail_chain_products (
  chain_id uuid NOT NULL
    REFERENCES app.retail_chains (id) ON DELETE CASCADE,
  product_slug text NOT NULL,
  available boolean NOT NULL DEFAULT false,
  updated_at timestamptz,
  updated_by text,
  PRIMARY KEY (chain_id, product_slug)
);

CREATE INDEX IF NOT EXISTS retail_chain_products_slug_idx
  ON app.retail_chain_products (product_slug);

CREATE TABLE IF NOT EXISTS app.retail_assortment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chain_id uuid NOT NULL
    REFERENCES app.retail_chains (id) ON DELETE CASCADE,
  product_slug text NOT NULL,
  action text NOT NULL,
  actor text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS retail_assortment_events_chain_idx
  ON app.retail_assortment_events (chain_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE app.retail_chains TO gletcher_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE app.retail_chain_products TO gletcher_app;
GRANT SELECT, INSERT ON TABLE app.retail_assortment_events TO gletcher_app;
GRANT SELECT ON TABLE app.retail_chains TO gletcher_nocodb;
GRANT SELECT ON TABLE app.retail_chain_products TO gletcher_nocodb;
REVOKE ALL ON TABLE app.retail_chains FROM PUBLIC;
REVOKE ALL ON TABLE app.retail_chain_products FROM PUBLIC;
REVOKE ALL ON TABLE app.retail_assortment_events FROM PUBLIC;
REVOKE ALL ON TABLE app.retail_assortment_events FROM gletcher_nocodb;
REVOKE ALL ON TABLE app.retail_chains FROM gletcher_worker;
REVOKE ALL ON TABLE app.retail_chain_products FROM gletcher_worker;
REVOKE ALL ON TABLE app.retail_assortment_events FROM gletcher_worker;
