// app/components/user/UserTableRow.tsx
"use client";

import { User } from "@/app/types/usermanager";
import { formatDateTime } from "@/app/utils/helper";
import React from "react";

interface UserTableRowProps {
  user: User;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onViewDetails: () => void;
}

const UserTableRow: React.FC<UserTableRowProps> = ({
  user,
  isSelected,
  onSelect,
  onEdit,
  onViewDetails,
}) => {
  const getRoleBadge = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
            Admin
          </span>
        );
      case "manager":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Manager
          </span>
        );
      case "support":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-500/10 text-teal-400 border border-teal-500/20">
            Support
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">
            User
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="size-1.5 rounded-full bg-emerald-400 mr-1.5" />
            Active
          </span>
        );
      case "inactive":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">
            <span className="size-1.5 rounded-full bg-slate-400 mr-1.5" />
            Inactive
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <span className="size-1.5 rounded-full bg-amber-400 mr-1.5" />
            Pending
          </span>
        );
      case "suspended":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
            <span className="size-1.5 rounded-full bg-red-400 mr-1.5" />
            Suspended
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">
            {status}
          </span>
        );
    }
  };

  const getEmailVerifiedIcon = (verified: boolean) => {
    return verified ? (
      <span className="material-symbols-outlined text-emerald-500 text-[16px]" title="Email Verified">
        verified
      </span>
    ) : (
      <span className="material-symbols-outlined text-slate-500 text-[16px]" title="Email Not Verified">
        cancel
      </span>
    );
  };

  return (
    <tr className="group hover:bg-white/[0.02] transition-colors">
      {/* Checkbox */}
      <td className="py-4 px-4 text-center">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="rounded border-slate-600 bg-surface-dark text-primary focus:ring-offset-surface-dark focus:ring-primary/50"
        />
      </td>

      {/* Name & Avatar */}
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="size-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center ring-2 ring-transparent group-hover:ring-primary/50 transition-all">
              <span className="text-white font-bold text-sm">
                {user.first_name?.[0]}
                {user.last_name?.[0]}
              </span>
            </div>
            {user.status === "active" && (
              <div className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 border-2 border-surface-dark" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">
              {user.first_name} {user.last_name}
            </p>
            <p className="text-xs text-slate-400">ID: {user._id.slice(-6).toUpperCase()}</p>
          </div>
        </div>
      </td>

      {/* Email */}
      <td className="py-4 px-4 hidden lg:table-cell">
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-slate-300 text-sm">
              {user.email}
              {getEmailVerifiedIcon(user.email_verified)}
            </div>
            {user.phone && (
              <div className="text-xs text-slate-400 mt-0.5">
                {user.phone}
              </div>
            )}
          </div>
        </div>
      </td>

      {/* Role */}
      <td className="py-4 px-4">
        {getRoleBadge(user.role)}
        {user.department && (
          <p className="text-xs text-slate-400 mt-1">{user.department}</p>
        )}
      </td>

      {/* Status */}
      <td className="py-4 px-4">
        {getStatusBadge(user.status)}
        {user.last_login && (
          <p className="text-xs text-slate-400 mt-1">
            {formatDateTime(user.last_login, "date")}
          </p>
        )}
      </td>

      {/* Last Login */}
      <td className="py-4 px-4 hidden md:table-cell">
        <div className="flex flex-col">
          <span className="text-sm text-slate-300">
            {user.last_login 
              ? formatDateTime(user.last_login, "date")
              : "Never"
            }
          </span>
          {user.login_count !== undefined && (
            <span className="text-xs text-slate-400">
              {user.login_count} logins
            </span>
          )}
        </div>
      </td>

      {/* Actions */}
      <td className="py-4 px-4 text-right">
        <div className="flex justify-end gap-2">
          <button
            onClick={onViewDetails}
            className="text-primary hover:text-white hover:bg-primary px-3 py-1.5 rounded-md text-xs font-bold transition-all border border-transparent hover:border-primary/50"
          >
            View
          </button>
          <button
            onClick={onEdit}
            className="text-slate-400 hover:text-white hover:bg-slate-700 px-3 py-1.5 rounded-md text-xs font-bold transition-all border border-transparent hover:border-slate-600"
          >
            Edit
          </button>
          <div className="relative group">
            <button className="text-slate-400 hover:text-white hover:bg-slate-700 px-2 py-1.5 rounded-md text-xs transition-all">
              <span className="material-symbols-outlined text-[18px]">
                more_vert
              </span>
            </button>
            <div className="absolute right-0 top-full mt-1 w-40 bg-surface-dark border border-surface-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-surface-border hover:text-white transition-colors">
                Reset Password
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-surface-border hover:text-white transition-colors">
                Send Message
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors">
                Suspend Account
              </button>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
};

export default UserTableRow;