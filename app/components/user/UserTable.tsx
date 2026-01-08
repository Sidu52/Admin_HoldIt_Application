"use client";

import React, { useCallback, useMemo } from "react";
import { User } from "@/app/types/user";
import Pagination from "../common/Pagination";
import { MdDelete, MdPerson } from "react-icons/md";
import {
  formatDateTime,
  getFullName,
  getUserNameFirstChar,
} from "@/app/utils/helper";
import { getStatusBadge } from "../common/GetStatus";

interface PaginationProps {
  page: number;
  totalPages: number;
}

interface UserTableProps {
  users: User[];
  selectedUsers: User[];
  onSelectionChange: (users: User[]) => void;
  onViewDetails: (user: User) => void;
  onDeleteClick: () => void;
  pagination: PaginationProps;
  onPageChange: (page: number) => void;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  selectedUsers,
  onSelectionChange,
  onViewDetails,
  onDeleteClick,
  pagination,
  onPageChange,
}) => {
  // ---------------- SELECTION HELPERS ----------------
  const selectedIds = useMemo(
    () => new Set(selectedUsers.map((u) => u._id)),
    [selectedUsers]
  );

  const allSelected =
    users.length > 0 && users.every((u) => selectedIds.has(u._id));
  const someSelected = users.some((u) => selectedIds.has(u._id));

  // ---------------- HANDLERS ----------------
  const handleSelectUser = useCallback(
    (user: User) => {
      if (selectedIds.has(user._id)) {
        onSelectionChange(selectedUsers.filter((u) => u._id !== user._id));
      } else {
        onSelectionChange([...selectedUsers, user]);
      }
    },
    [selectedIds, selectedUsers, onSelectionChange]
  );

  const handleSelectAll = useCallback(() => {
    if (allSelected) {
      const remaining = selectedUsers.filter(
        (u) => !users.some((usr) => usr._id === u._id)
      );
      onSelectionChange(remaining);
    } else {
      const merged = [
        ...selectedUsers.filter((u) => !users.some((usr) => usr._id === u._id)),
        ...users,
      ];
      onSelectionChange(merged);
    }
  }, [allSelected, users, selectedUsers, onSelectionChange]);

  // ---------------- RENDER ----------------
  return (
    <div className="flex flex-col h-full bg-surface-dark border border-surface-border rounded-2xl shadow-sm overflow-hidden">
      {/* TABLE */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse text-sm">
          {/* HEAD */}
          <thead className="sticky top-0 z-10 bg-surface-dark/95 backdrop-blur border-b border-surface-border">
            <tr className="text-slate-400">
              <th className="w-14 px-4 py-3 text-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = !allSelected && someSelected;
                  }}
                  onChange={handleSelectAll}
                  className="rounded border-slate-600 bg-surface-dark text-primary focus:ring-primary/40"
                />
              </th>

              <th className="px-4 py-3 text-left font-semibold tracking-wide uppercase text-xs">
                User
              </th>

              <th className="px-4 py-3 text-left font-semibold tracking-wide uppercase text-xs hidden lg:table-cell">
                Phone
              </th>

              <th className="px-4 py-3 text-left font-semibold tracking-wide uppercase text-xs">
                Status
              </th>

              <th className="px-4 py-3 text-left font-semibold tracking-wide uppercase text-xs hidden md:table-cell">
                Last login
              </th>

              <th className="px-4 py-3 text-right font-semibold tracking-wide uppercase text-xs">
                Actions
              </th>
            </tr>
          </thead>

          {/* BODY */}
          <tbody className="divide-y divide-surface-border">
            {users.map((user) => (
              <UserTableRow
                key={user._id}
                user={user}
                isSelected={selectedIds.has(user._id)}
                onSelect={() => handleSelectUser(user)}
                onDelete={onDeleteClick}
                onViewDetails={() => onViewDetails(user)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {pagination.totalPages > 1 && (
        <div className="border-t border-surface-border">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={onPageChange}
            siblingCount={1}
          />
        </div>
      )}
    </div>
  );
};

export default UserTable;

// ======================================================
// =================== ROW COMPONENT ====================
// ======================================================

interface UserTableRowProps {
  isSelected: boolean;
  onSelect: () => void;
  onViewDetails: () => void;
  user: User;
  onDelete: () => void;
}

const UserTableRow = ({
  isSelected,
  onSelect,
  onViewDetails,
  user,
  onDelete,
}: UserTableRowProps) => {
  return (
    <tr
      className={`group transition-colors ${
        isSelected ? "bg-primary/5" : "hover:bg-white/[0.03]"
      }`}
    >
      {/* CHECKBOX */}
      <td className="px-4 py-4 text-center align-middle">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="rounded border-slate-600 bg-surface-dark text-primary focus:ring-primary/40"
        />
      </td>

      {/* USER */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center font-bold text-white">
            {getUserNameFirstChar(user.first_name, user.last_name)}
          </div>

          <div className="leading-tight">
            <p className="font-semibold text-white">
              {getFullName(user.first_name, user.last_name)}
            </p>
            <p className="text-xs text-slate-400">
              ID: {user._id.slice(-6).toUpperCase()}
            </p>
          </div>
        </div>
      </td>

      {/* PHONE */}
      <td className="px-4 py-4 hidden lg:table-cell text-slate-300">
        {user.phone || "-"}
      </td>

      {/* STATUS */}
      <td className="px-4 py-4">{getStatusBadge(user.status)}</td>

      {/* LAST LOGIN */}
      <td className="px-4 py-4 hidden md:table-cell text-slate-300">
        {user.last_login_at ? formatDateTime(user.last_login_at, "date") : "-"}
      </td>

      {/* ACTIONS */}
      <td className="px-4 py-4 text-right">
        <div className="flex justify-end gap-2">
          <button
            onClick={onViewDetails}
            className="p-2 rounded-lg border border-surface-border hover:border-primary/40 hover:bg-primary/10 text-primary transition"
          >
            <MdPerson size={18} />
          </button>

          <button
            onClick={onDelete}
            className="p-2 rounded-lg border border-surface-border hover:border-red-400/40 hover:bg-red-500/10 text-red-400 transition"
          >
            <MdDelete size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
};
