-- M2 P1: member magic-link tokens + sessions (email identity).
-- Tokens store only sha256 hash; raw token never persisted.

CREATE TABLE IF NOT EXISTS app.loyalty_magic_link_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email_normalized text NOT NULL,
  token_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  request_ip text,
  user_agent text
);

CREATE UNIQUE INDEX IF NOT EXISTS loyalty_magic_link_token_hash_uidx
  ON app.loyalty_magic_link_tokens (token_hash);

CREATE INDEX IF NOT EXISTS loyalty_magic_link_email_idx
  ON app.loyalty_magic_link_tokens (email_normalized, created_at DESC);

CREATE TABLE IF NOT EXISTS app.loyalty_member_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES app.loyalty_members (id) ON DELETE CASCADE,
  session_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  last_seen_at timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS loyalty_member_sessions_hash_uidx
  ON app.loyalty_member_sessions (session_hash);

CREATE INDEX IF NOT EXISTS loyalty_member_sessions_member_idx
  ON app.loyalty_member_sessions (member_id, expires_at);
