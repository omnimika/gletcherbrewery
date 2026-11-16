-- Allow up to 10 open agent applications per member (app-enforced).
-- Open = any status except approved|rejected. Drop single-active unique.

DROP INDEX IF EXISTS app.loyalty_agent_applications_one_active_uidx;
