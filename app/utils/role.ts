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
      "coupans",
      "serviceable-areas",
      "price-rules",
      "profile",
      "support",
      "notifications",
    ],
    control: [
      "dashboard",
      "users",
      "drivers",
      "stores",
      "store-owners",
      "teams",
      "bookings",
      "coupans",
      "serviceable-areas",
      "price-rules",
      "profile",
      "support",
      "notifications",
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
      "coupans",
      "serviceable-areas",
      "price-rules",
      "profile",
      "support",
      "notifications",
    ],
    control: [
      "dashboard",
      "users",
      "drivers",
      "stores",
      "store-owners",
      "teams",
      "bookings",
      "coupans",
      "serviceable-areas",
      "price-rules",
      "profile",
      "support",
      "notifications",
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
      "coupans",
      "serviceable-areas",
      "price-rules",
      "profile",
      "support",
      "notifications",
    ],
    control: ["dashboard", "bookings", "coupans", "profile", "notifications"],
  },
  [ROLES.CUSTOMER_SUPPORT]: {
    access: [
      "dashboard",
      "profile",
      "bookings",
      "coupans",
      "support",
      "stores",
      "store-owners",
      "drivers",
      "users",
      "serviceable-areas",
      "price-rules",
    ],
    control: ["support", "bookings"],
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


export function hasControl(role: string | undefined, module: string): boolean {
  if (!role) return false;
  const permissions = ROLE_PERMISSIONS[role as Role];
  if (!permissions) return false;
  return permissions.control.includes(module);
}

export function canModifyUser(actorRole: string | undefined, targetRole: string | undefined): boolean {
  if (!actorRole) return false;
  if (actorRole === ROLES.SUPER_ADMIN) return true;
  if (actorRole === ROLES.ADMIN) {
    return targetRole !== ROLES.SUPER_ADMIN;
  }
  // Operation managers and support do not have control over editing users
  return false;
}
