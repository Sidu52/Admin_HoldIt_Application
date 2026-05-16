"use client";

import React from "react";

interface StatusBadgeProps {
  status: string | boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const base = "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border";

  // Handle boolean states (e.g. isOnline)
  if (typeof status === "boolean") {
    return status ? (
      <span className={`${base} bg-emerald-500/10 text-emerald-400 border-emerald-500/30`}>
        <span className="size-1.5 rounded-full bg-emerald-400" /> Yes
      </span>
    ) : (
      <span className={`${base} bg-slate-500/10 text-slate-400 border-slate-500/30`}>
        <span className="size-1.5 rounded-full bg-slate-400" /> No
      </span>
    );
  }

  const s = status.toUpperCase();

  switch (s) {
    case "ACTIVE":
    case "ONLINE":
    case "DELIVERED":
    case "VERIFIED":
      return (
        <span className={`${base} bg-emerald-500/10 text-emerald-500 border-emerald-500/30`}>
          <span className="size-1.5 rounded-full bg-emerald-500" /> {status}
        </span>
      );
    case "INACTIVE":
    case "OFFLINE":
    case "CANCELLED":
    case "UNVERIFIED":
      return (
        <span className={`${base} bg-slate-500/10 text-slate-500 border-slate-500/30`}>
          <span className="size-1.5 rounded-full bg-slate-500" /> {status}
        </span>
      );
    case "PENDING":
      return (
        <span className={`${base} bg-amber-500/10 text-amber-500 border-amber-500/30`}>
          <span className="size-1.5 rounded-full bg-amber-500" /> {status}
        </span>
      );
    case "BLOCKED":
      return (
        <span className={`${base} bg-red-500/10 text-red-500 border-red-500/30`}>
          <span className="size-1.5 rounded-full bg-red-500" /> {status}
        </span>
      );
    case "DRIVER_ASSIGNED":
    case "DRIVER_ARRIVED":
    case "PICKED_UP":
    case "STORED":
    case "RETURN_REQUESTED":
      return (
        <span className={`${base} bg-blue-500/10 text-blue-500 border-blue-500/30`}>
          <span className="size-1.5 rounded-full bg-blue-500" /> {status.replace(/_/g, " ")}
        </span>
      );
    default:
      return (
        <span className={`${base} bg-gray-500/10 text-gray-500 border-gray-500/30`}>
          {status}
        </span>
      );
  }
};
