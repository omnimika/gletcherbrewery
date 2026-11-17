import { isStaffAuthConfigured } from "./auth";
import type { StaffActor } from "./commands";
import { getStaffPageSession } from "./request-auth";
import { roleAllows, type StaffRole } from "./roles";

export type StaffPageGate =
  | { status: "unconfigured" }
  | { status: "login" }
  | { status: "forbidden"; actor: StaffActor }
  | { status: "ok"; actor: StaffActor };

export async function gateStaffPage(
  allowed: readonly StaffRole[],
): Promise<StaffPageGate> {
  if (!isStaffAuthConfigured()) return { status: "unconfigured" };
  const actor = await getStaffPageSession();
  if (!actor) return { status: "login" };
  if (!roleAllows(actor.role, allowed)) {
    return { status: "forbidden", actor };
  }
  return { status: "ok", actor };
}
