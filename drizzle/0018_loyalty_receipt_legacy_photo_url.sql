-- Legacy Airtable/Tilda check image URL (column `check`) until Object Storage cutover.
ALTER TABLE app.loyalty_receipts
  ADD COLUMN IF NOT EXISTS legacy_photo_url text;
