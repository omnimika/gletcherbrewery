import { cookies } from "next/headers";
import {
  isStaffAuthConfigured,
  readBearerToken,
  STAFF_COOKIE_NAME,
  staffMisconfiguredResponse,
  staffUnauthorizedResponse,
  verifyStaffToken,
} from "./auth";
import type { StaffActor } from "./commands";

export type StaffAuthOk = {
  ok: true;
  actor: StaffActor;
};

export type StaffAuthFail = {
  ok: false;
  response: Response;
};

export async function requireStaffAuth(
  request: Request,
): Promise<StaffAuthOk | StaffAuthFail> {
  if (!isStaffAuthConfigured()) {
    return { ok: false, response: staffMisconfiguredResponse() };
  }

  const bearer = readBearerToken(request);
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(STAFF_COOKIE_NAME)?.value ?? null;
  const token = bearer || cookieToken;

  if (!verifyStaffToken(token)) {
    return { ok: false, response: staffUnauthorizedResponse() };
  }

  const actorHeader = request.headers.get("x-staff-actor")?.trim();
  const actorId =
    actorHeader && actorHeader.length > 0
      ? actorHeader.slice(0, 80)
      : "staff";

  return { ok: true, actor: { id: actorId } };
}
