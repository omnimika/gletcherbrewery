-- Per-store SKU overrides: inherit chain matrix or explicit location products.

ALTER TABLE app.retail_locations
  ADD COLUMN IF NOT EXISTS assortment_mode text NOT NULL DEFAULT 'inherit';

CREATE INDEX IF NOT EXISTS retail_locations_assortment_mode_idx
  ON app.retail_locations (assortment_mode);

COMMENT ON COLUMN app.retail_locations.assortment_mode IS
  'inherit = use chain Product; override = use retail_location_products';
