import type { StaffActor } from "./commands";
import type { StaffRole } from "./roles";

/** Synthetic StaffActor for unit/integration tests (not a real session). */
export function testStaffActor(
  label = "tester@example.com",
  role: StaffRole = "admin",
): StaffActor {
  const email = label.includes("@") ? label.toLowerCase() : `${label}@example.com`;
  return {
    id: email,
    email,
    role,
    userId: "00000000-0000-4000-8000-0000000000aa",
    sessionId: "00000000-0000-4000-8000-0000000000bb",
  };
}
