# ADR 0012 — Staff auth and RBAC

Дата: **17.11.2026**. Status: **Accepted** (M2-5 slice 1).
Owner: локальный вход `/staff` email+token проверен 17.11 — OK.
Контекст: [AGENT_CRM_WORKFLOWS](../backend/AGENT_CRM_WORKFLOWS.md),
[FORMS_DATA_PIPELINE](../backend/FORMS_DATA_PIPELINE.md),
[CURSOR_NEXT_STEPS](../CURSOR_NEXT_STEPS.md).

## Проблема

Shared `STAFF_API_TOKEN` + cookie с тем же секретом и заголовок `x-staff-actor`
достаточны только как локальный spike. Actor от клиента не доказывает личность;
один токен не разделяет роли loyalty / retail / admin. Shared staging требует
server-side identity и audited actor из БД.

## Решение (Accepted)

1. Таблицы `app.staff_users` (email, role, active) и `app.staff_sessions`
   (token hash, expiry, revoke). Сырой session token только в httpOnly cookie /
   Bearer; в БД — sha256.
2. Login: **email** из allowlist (`staff_users`) + bootstrap secret
   (`STAFF_API_TOKEN` ≥16). Создаёт session; cookie **не** равна bootstrap secret.
3. `requireStaffAuth` резолвит session → `{ id, email, role }`. Заголовок
   `x-staff-actor` **игнорируется** и не влияет на audit.
4. Roles v1: `admin`, `loyalty_manager`, `retail_editor`.
   - loyalty APIs: `admin` | `loyalty_manager`
   - retail APIs: `admin` | `retail_editor`
   - leads + delivery replay: `admin` | `loyalty_manager`
5. Seed allowlist через env/`npm run staff:seed` — без PII в Git.
6. NocoDB: без write на staff_users/sessions; app — SELECT users + DML sessions.

## Out of scope (этот ADR)

Postbox/email magic для staff, Yandex/OIDC SSO, production cutover, Object Storage,
смена Members auth. Production DNS/writers — отдельные решения.

## Acceptance (slice 1)

Без валидной DB-сессии → 401; forged actor header не меняет audit; wrong role → 403;
logout revoke. Owner: login `/staff` OK 17.11.
