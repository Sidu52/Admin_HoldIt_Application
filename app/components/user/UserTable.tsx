"use client";
import React, { useCallback, useMemo } from "react";
import { User } from "@/app/types/user";
import Pagination from "../common/Pagination";
import { MdOutlineEdit, MdOutlineDelete, MdCheckCircle, MdCancel } from "react-icons/md";
import { RiArrowLeftSLine, RiArrowRightSLine } from "react-icons/ri";
import {
  getFullName,
  getUserNameFirstChar,
} from "@/app/utils/helper";
import { getStatusBadge } from "../common/GetStatus";
import { hasControl } from "@/app/utils/role";

interface PaginationProps {
  page: number;
  totalPages: number;
}

interface UserTableProps {
  users: User[];
  selectedUsers: User[];
  onSelectionChange: (users: User[]) => void;
  onViewDetails: (user: User) => void;
  onDeleteClick: (user: User) => void;
  pagination: PaginationProps;
  onPageChange: (page: number) => void;
  actorRole?: string;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  selectedUsers,
  onSelectionChange,
  onViewDetails,
  onDeleteClick,
  pagination,
  onPageChange,
  actorRole,
}) => {
  const canControlModule = hasControl(actorRole, "users");

  const selectedIds = useMemo(
    () => new Set(selectedUsers.map((u) => u._id)),
    [selectedUsers]
  );

  const allSelected = users.length > 0 && users.every((u) => selectedIds.has(u._id));
  const someSelected = users.some((u) => selectedIds.has(u._id));

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

  return (
    <div className="card-premium flex-1 flex flex-col overflow-hidden p-0 bg-surface-light dark:bg-surface-dark border-border-light dark:border-border-dark shadow-premium/5">
      <div className="flex-1 overflow-auto">
        <table className="w-full border-separate border-spacing-0">
          <thead className="bg-background-light dark:bg-background-dark">
            <tr>
              <th className="sticky top-0 z-10 w-14 px-6 py-4 border-b border-border-light dark:border-border-dark">
                <div className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    disabled={!canControlModule}
                    ref={(el) => {
                      if (el) el.indeterminate = !allSelected && someSelected;
                    }}
                    onChange={handleSelectAll}
                    className="rounded-lg border-border-light dark:border-border-dark text-primary focus:ring-primary/30 cursor-pointer h-4 w-4 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  />
                </div>
              </th>
              <th className="sticky top-0 z-10 px-6 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-text-muted-light dark:text-text-muted-dark border-b border-border-light dark:border-border-dark">User Identity</th>
              <th className="sticky top-0 z-10 px-6 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-text-muted-light dark:text-text-muted-dark border-b border-border-light dark:border-border-dark hidden lg:table-cell">Contact Info</th>
              <th className="sticky top-0 z-10 px-6 py-4 text-center text-[11px] font-bold uppercase tracking-widest text-text-muted-light dark:text-text-muted-dark border-b border-border-light dark:border-border-dark">Status</th>
              <th className="sticky top-0 z-10 px-6 py-4 text-center text-[11px] font-bold uppercase tracking-widest text-text-muted-light dark:text-text-muted-dark border-b border-border-light dark:border-border-dark hidden md:table-cell">Eligibility</th>
              <th className="sticky top-0 z-10 px-6 py-4 text-right text-[11px] font-bold uppercase tracking-widest text-text-muted-light dark:text-text-muted-dark border-b border-border-light dark:border-border-dark">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light dark:divide-border-dark">
            {users.map((user) => {
              const modifiable = canControlModule;
              return (
                <tr
                  key={user._id}
                  className={`group transition-all duration-200 hover:bg-background-light dark:hover:bg-background-dark/50 ${selectedIds.has(user._id) ? "bg-primary/[0.02]" : ""
                    }`}
                >
                  <td className="px-6 py-5 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(user._id)}
                      disabled={!modifiable}
                      onChange={() => handleSelectUser(user)}
                      className="rounded-lg border-border-light dark:border-border-dark text-primary focus:ring-primary/30 cursor-pointer h-4 w-4 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    />
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 shrink-0 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-xs shadow-lg shadow-primary/10">
                        {getUserNameFirstChar(user.first_name, user.last_name)}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-bold text-text-main-light dark:text-text-main-dark group-hover:text-primary transition-colors">
                          {getFullName(user.first_name, user.last_name)}
                        </span>
                        <span className="text-[10px] font-bold text-text-muted-light uppercase tracking-tight">ID-{user._id.slice(-6).toUpperCase()}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 hidden lg:table-cell">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-bold text-text-main-light dark:text-text-main-dark">{user.phone || "N/A"}</span>
                      <span className="text-[10px] font-bold text-text-muted-light uppercase tracking-tight">{user.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    {getStatusBadge(user.account_status)}
                  </td>
                  <td className="px-6 py-5 hidden md:table-cell text-center">
                    <div className="flex justify-center">
                      {user.is_serviceable ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-bold border border-emerald-500/20">
                          <MdCheckCircle size={14} /> Serviceable
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-500/10 text-slate-600 text-[10px] font-bold border border-slate-500/20">
                          <MdCancel size={14} /> Non-serviceable
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onViewDetails(user)}
                        className="p-2 rounded-lg text-text-muted-light dark:text-text-muted-dark hover:text-primary hover:bg-primary/10 transition-all"
                      >
                        <MdOutlineEdit size={18} />
                      </button>
                      {modifiable && (
                        <button
                          onClick={() => onDeleteClick(user)}
                          className="p-2 rounded-lg text-text-muted-light dark:text-text-muted-dark hover:text-rose-600 hover:bg-rose-500/10 transition-all"
                        >
                          <MdOutlineDelete size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center">
                  <p className="text-sm font-bold text-text-muted-light uppercase tracking-widest">No users found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="px-8 py-5 bg-background-light/30 dark:bg-background-dark/30 border-t border-border-light dark:border-border-dark flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] font-bold text-text-muted-light uppercase tracking-wider">
            Page <span className="text-text-main-light dark:text-text-main-dark">{pagination.page}</span> of <span className="text-primary">{pagination.totalPages}</span>
          </p>
          <div className="flex items-center gap-4">
            <button
              disabled={pagination.page <= 1}
              onClick={() => onPageChange(pagination.page - 1)}
              className="p-2 rounded-xl border border-border-light dark:border-border-dark hover:bg-surface-light dark:hover:bg-surface-dark disabled:opacity-30 transition-all"
            >
              <RiArrowLeftSLine size={20} className="text-text-main-light dark:text-text-main-dark" />
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => onPageChange(pagination.page + 1)}
              className="p-2 rounded-xl border border-border-light dark:border-border-dark hover:bg-surface-light dark:hover:bg-surface-dark disabled:opacity-30 transition-all"
            >
              <RiArrowRightSLine size={20} className="text-text-main-light dark:text-text-main-dark" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTable;

