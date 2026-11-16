-- M2: member «Стать агентом» applications (Make mod 50 / Airtable Агенты fields).

CREATE TABLE IF NOT EXISTS app.loyalty_agent_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES app.loyalty_members (id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'under_review',
  phone text NOT NULL,
  city text NOT NULL,
  venue_name text NOT NULL,
  venue_type text NOT NULL,
  venue_address text NOT NULL,
  venue_boss text,
  comment text,
  legacy_order_id text,
  airtable_agent_id text,
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS loyalty_agent_applications_airtable_uidx
  ON app.loyalty_agent_applications (airtable_agent_id);

CREATE INDEX IF NOT EXISTS loyalty_agent_applications_member_idx
  ON app.loyalty_agent_applications (member_id, created_at DESC);

CREATE INDEX IF NOT EXISTS loyalty_agent_applications_status_idx
  ON app.loyalty_agent_applications (status, created_at DESC);
