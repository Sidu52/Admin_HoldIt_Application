"use client";

import React, { ReactNode } from "react";
import { usePermission } from "../../hooks/usePermission";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: string[];
  fallback?: ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ children, allowedRoles, fallback = null }) => {
  const hasPermission = usePermission(allowedRoles);

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
