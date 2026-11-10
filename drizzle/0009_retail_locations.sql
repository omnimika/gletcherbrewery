-- M1 store-level CRM: retail points linked to chains.
-- Assortment remains chain-level for now; location_products reserved for overrides.

CREATE TABLE IF NOT EXISTS app.retail_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chain_id uuid REFERENCES app.retail_chains (id) ON DELETE SET NULL,
  map_layer_id text,
  source_key text NOT NULL,
  source_title text NOT NULL,
  type text,
  city text,
  adress text,
  packing text,
  product_snapshot text,
  longitude double precision NOT NULL,
  latitude double precision NOT NULL,
  status text NOT NULL DEFAULT 'active',
  source_file text NOT NULL,
  external_id text,
  imported_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS retail_locations_source_key_uidx
  ON app.retail_locations (source_key);

CREATE INDEX IF NOT EXISTS retail_locations_chain_idx
  ON app.retail_locations (chain_id);

CREATE INDEX IF NOT EXISTS retail_locations_layer_idx
  ON app.retail_locations (map_layer_id);

CREATE INDEX IF NOT EXISTS retail_locations_status_idx
  ON app.retail_locations (status);

CREATE INDEX IF NOT EXISTS retail_locations_coords_idx
  ON app.retail_locations (longitude, latitude);

CREATE TABLE IF NOT EXISTS app.retail_location_products (
  location_id uuid NOT NULL
    REFERENCES app.retail_locations (id) ON DELETE CASCADE,
  product_slug text NOT NULL,
  available boolean NOT NULL DEFAULT false,
  updated_at timestamptz,
  updated_by text,
  PRIMARY KEY (location_id, product_slug)
);

CREATE INDEX IF NOT EXISTS retail_location_products_slug_idx
  ON app.retail_location_products (product_slug);

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE app.retail_locations TO gletcher_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE app.retail_location_products TO gletcher_app;
GRANT SELECT ON TABLE app.retail_locations TO gletcher_nocodb;
GRANT SELECT ON TABLE app.retail_location_products TO gletcher_nocodb;
REVOKE ALL ON TABLE app.retail_locations FROM PUBLIC;
REVOKE ALL ON TABLE app.retail_location_products FROM PUBLIC;
REVOKE ALL ON TABLE app.retail_locations FROM gletcher_worker;
REVOKE ALL ON TABLE app.retail_location_products FROM gletcher_worker;
