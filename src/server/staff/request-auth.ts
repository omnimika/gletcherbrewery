import { cookies } from "next/headers";
import { getDb } from "@/server/db/client";
import {
  isStaffAuthConfigured,
  readBearerToken,
  STAFF_COOKIE_NAME,
  staffForbiddenResponse,
  staffMisconfiguredResponse,
  staffUnauthorizedResponse,
} from "./auth";
import type { StaffActor } from "./commands";
import { roleAllows, type StaffRole } from "./roles";
import { resolveStaffSession } from "./sessions";

export type StaffAuthOk = {
  ok: true;
  actor: StaffActor;
};

export type StaffAuthFail = {
  ok: false;
  response: Response;
};

/**
 * Resolve DB-backed staff session from cookie or Bearer.
 * Ignores x-staff-actor (client labels are not identity).
 */
export async function requireStaffAuth(
  _request: Request,
): Promise<StaffAuthOk | StaffAuthFail> {
  if (!isStaffAuthConfigured()) {
    return { ok: false, response: staffMisconfiguredResponse() };
  }

  const bearer = readBearerToken(_request);
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(STAFF_COOKIE_NAME)?.value ?? null;
  const raw = bearer || cookieToken;

  const resolved = await resolveStaffSession(getDb(), raw);
  if (!resolved) {
    return { ok: false, response: staffUnauthorizedResponse() };
  }

  return {
    ok: true,
    actor: {
      id: resolved.email,
      email: resolved.email,
      role: resolved.role,
      userId: resolved.userId,
      sessionId: resolved.sessionId,
    },
  };
}

export function requireStaffRole(
  auth: StaffAuthOk,
  allowed: readonly StaffRole[],
): StaffAuthFail | null {
  if (!roleAllows(auth.actor.role, allowed)) {
    return { ok: false, response: staffForbiddenResponse() };
  }
  return null;
}

/** RSC helper: current staff session or null. */
export async function getStaffPageSession(): Promise<StaffActor | null> {
  if (!isStaffAuthConfigured()) return null;
  const cookieStore = await cookies();
  const raw = cookieStore.get(STAFF_COOKIE_NAME)?.value ?? null;
  const resolved = await resolveStaffSession(getDb(), raw);
  if (!resolved) return null;
  return {
    id: resolved.email,
    email: resolved.email,
    role: resolved.role,
    userId: resolved.userId,
    sessionId: resolved.sessionId,
  };
}
