-- Owner Confirmed 09.11.2026: cancel Google Sheets as lead destination (152-FZ).
-- Retail map spreadsheet remains a separate read-only import source (not leads).

UPDATE app.delivery_jobs
SET
  status = 'cancelled_policy',
  last_error = 'sheets_cancelled_152fz',
  lease_owner = NULL,
  lease_token = NULL,
  lease_expires_at = NULL,
  updated_at = now()
WHERE destination = 'sheets'
  AND status NOT IN ('cancelled_policy', 'delivered');
