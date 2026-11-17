-- M2-5 slice 1: staff users + sessions (server-side identity / RBAC).
-- Bootstrap secret STAFF_API_TOKEN only for login; cookie holds opaque session.

CREATE TABLE IF NOT EXISTS app.staff_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  display_name text,
  role text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT staff_users_role_chk CHECK (
    role IN ('admin', 'loyalty_manager', 'retail_editor')
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS staff_users_email_uidx
  ON app.staff_users (lower(email));

CREATE TABLE IF NOT EXISTS app.staff_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES app.staff_users (id) ON DELETE CASCADE,
  token_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  last_seen_at timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS staff_sessions_token_hash_uidx
  ON app.staff_sessions (token_hash);

CREATE INDEX IF NOT EXISTS staff_sessions_user_idx
  ON app.staff_sessions (user_id, expires_at);

REVOKE ALL ON TABLE app.staff_users FROM PUBLIC;
REVOKE ALL ON TABLE app.staff_sessions FROM PUBLIC;
REVOKE ALL ON TABLE app.staff_users FROM gletcher_worker;
REVOKE ALL ON TABLE app.staff_sessions FROM gletcher_worker;
REVOKE ALL ON TABLE app.staff_users FROM gletcher_nocodb;
REVOKE ALL ON TABLE app.staff_sessions FROM gletcher_nocodb;

GRANT SELECT ON TABLE app.staff_users TO gletcher_app;
GRANT SELECT, INSERT, UPDATE ON TABLE app.staff_sessions TO gletcher_app;
