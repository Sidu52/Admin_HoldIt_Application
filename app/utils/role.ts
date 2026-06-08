import { ROLES } from "@/app/enum";

export type Role = typeof ROLES[keyof typeof ROLES];

export interface RolePermissions {
  access: string[];
  control: string[];
}

export const ROLE_PERMISSIONS: Record<Role, RolePermissions> = {
  [ROLES.SUPER_ADMIN]: {
    access: [
      "dashboard",
      "users",
      "drivers",
      "stores",
      "store-owners",
      "teams",
      "bookings",
      "serviceable-areas",
      "profile",
      "support",
    ],
    control: [
      "dashboard",
      "users",
      "drivers",
      "stores",
      "store-owners",
      "teams",
      "bookings",
      "serviceable-areas",
      "profile",
      "support",
    ],
  },
  [ROLES.ADMIN]: {
    access: [
      "dashboard",
      "users",
      "drivers",
      "stores",
      "store-owners",
      "teams",
      "bookings",
      "serviceable-areas",
      "profile",
      "support",
    ],
    control: [
      "dashboard",
      "users",
      "drivers",
      "stores",
      "store-owners",
      "teams",
      "bookings",
      "serviceable-areas",
      "profile",
      "support",
    ],
  },
  [ROLES.OPERATION_MANAGER]: {
    access: [
      "dashboard",
      "stores",
      "drivers",
      "users",
      "store-owners",
      "bookings",
      "serviceable-areas",
      "profile",
    ],
    control: ["dashboard", "bookings", "profile"],
  },
  [ROLES.CUSTOMER_SUPPORT]: {
    access: [
      "dashboard",
      "profile",
      "bookings",
      "support",
      "stores",
      "store-owners",
      "drivers",
      "users",
    ],
    control: ["support"],
  },
};

/**
 * Check if a role has access (view permission) to a specific module.
 */
export function hasAccess(role: string | undefined, module: string): boolean {
  if (!role) return false;
  const permissions = ROLE_PERMISSIONS[role as Role];
  if (!permissions) return false;
  return permissions.access.includes(module);
}

/**
 * Check if a role has control (write/edit/delete/status toggle) over a specific module.
 */
export function hasControl(role: string | undefined, module: string): boolean {
  if (!role) return false;
  const permissions = ROLE_PERMISSIONS[role as Role];
  if (!permissions) return false;
  return permissions.control.includes(module);
}

/**
 * Check if the current actor can update or delete a target user based on their roles.
 * e.g., Admin cannot update/delete Super Admin.
 */
export function canModifyUser(actorRole: string | undefined, targetRole: string | undefined): boolean {
  if (!actorRole) return false;
  if (actorRole === ROLES.SUPER_ADMIN) return true;
  if (actorRole === ROLES.ADMIN) {
    return targetRole !== ROLES.SUPER_ADMIN;
  }
  // Operation managers and support do not have control over editing users
  return false;
}
