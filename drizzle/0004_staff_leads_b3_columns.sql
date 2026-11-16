-- B3: extra staff CRM columns for partnership / horeca / tours / newsletter.

ALTER TABLE app.staff_contact_leads
  ADD COLUMN IF NOT EXISTS partner_type text,
  ADD COLUMN IF NOT EXISTS inn text,
  ADD COLUMN IF NOT EXISTS tour_date text,
  ADD COLUMN IF NOT EXISTS guests text,
  ADD COLUMN IF NOT EXISTS wishes text;

ALTER TABLE public.staff_contact_leads
  ADD COLUMN IF NOT EXISTS partner_type text,
  ADD COLUMN IF NOT EXISTS inn text,
  ADD COLUMN IF NOT EXISTS tour_date text,
  ADD COLUMN IF NOT EXISTS guests text,
  ADD COLUMN IF NOT EXISTS wishes text;
