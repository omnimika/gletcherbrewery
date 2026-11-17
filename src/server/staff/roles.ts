export const STAFF_ROLES = [
  "admin",
  "loyalty_manager",
  "retail_editor",
] as const;

export type StaffRole = (typeof STAFF_ROLES)[number];

export function isStaffRole(value: string): value is StaffRole {
  return (STAFF_ROLES as readonly string[]).includes(value);
}

/** Loyalty receipts / agents / aliases. */
export const LOYALTY_STAFF_ROLES: readonly StaffRole[] = [
  "admin",
  "loyalty_manager",
];

/** Retail map CRM. */
export const RETAIL_STAFF_ROLES: readonly StaffRole[] = [
  "admin",
  "retail_editor",
];

/** Form leads CRM + delivery replay. */
export const LEADS_STAFF_ROLES: readonly StaffRole[] = [
  "admin",
  "loyalty_manager",
];

export function roleAllows(
  role: StaffRole,
  allowed: readonly StaffRole[],
): boolean {
  return allowed.includes(role);
}
