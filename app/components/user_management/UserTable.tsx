// app/components/user/UserTable.tsx
"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/app/hooks/useUserStore";
import { selectUser, selectAllUsers } from "@/app/store/slices/userSlice";

import UserTableRow from "./UserTableRow";
import { BsExclamationTriangle } from "react-icons/bs";
import { User } from "@/app/types/auth";
import LoadingSpinner from "../common/LoadingSpinner";

interface UserTableProps {
  onEditUser: (user: User) => void;
  onViewDetails: (user: User) => void;
}

const UserTable: React.FC<UserTableProps> = ({ onEditUser, onViewDetails }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { users, selectedUsers, pagination, loading, error } = useAppSelector(
    (state) => state.users
  );

  const [sortField, setSortField] = useState<keyof User>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const handleSelectUser = useCallback(
    (userId: string) => {
      dispatch(selectUser(userId));
    },
    [dispatch]
  );

  const handleSelectAll = useCallback(() => {
    dispatch(selectAllUsers());
  }, [dispatch]);

  const handleSort = useCallback(
    (field: keyof User) => {
      if (sortField === field) {
        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
      } else {
        setSortField(field);
        setSortDirection("asc");
      }
    },
    [sortField, sortDirection]
  );

  const handlePageChange = useCallback((page: number) => {
    // Dispatch action to change page
    // You'll need to implement this in your user slice
    console.log("Page change to:", page);
  }, []);

  const allSelected = users.length > 0 && selectedUsers.length === users.length;

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-surface-dark border border-surface-border rounded-xl shadow-sm overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full bg-surface-dark border border-surface-border rounded-xl shadow-sm overflow-hidden">
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <BsExclamationTriangle className="text-red-500 text-4xl mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">
            Error Loading Users
          </h3>
          <p className="text-slate-400 text-center">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="flex flex-col h-full bg-surface-dark border border-surface-border rounded-xl shadow-sm overflow-hidden">
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-slate-800/50 mb-4">
              <span className="material-symbols-outlined text-slate-400 text-3xl">
                person_off
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              No Users Found
            </h3>
            <p className="text-slate-400 mb-6">
              No users match your current filters. Try adjusting your search
              criteria.
            </p>
            <button
              onClick={() => {
                // Reset filters or add first user
                console.log("Add new user");
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              <span className="material-symbols-outlined">add</span>
              Add New User
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-surface-dark border border-surface-border rounded-xl shadow-sm overflow-hidden">
      {/* Table Container */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-surface-border/30 sticky top-0 z-10 backdrop-blur-sm">
            <tr>
              {/* Checkbox Column */}
              <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-400 w-16 text-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={handleSelectAll}
                  className="rounded border-slate-600 bg-surface-dark text-primary focus:ring-offset-surface-dark focus:ring-primary/50"
                />
              </th>

              {/* Name Column */}
              <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-400 min-w-[200px]">
                <button
                  onClick={() => handleSort("first_name")}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  Name
                  <span className="material-symbols-outlined text-[14px]">
                    {sortField === "first_name"
                      ? sortDirection === "asc"
                        ? "arrow_upward"
                        : "arrow_downward"
                      : "unfold_more"}
                  </span>
                </button>
              </th>

              {/* Email Column */}
              <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-400 min-w-[200px] hidden lg:table-cell">
                <button
                  onClick={() => handleSort("email")}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  Email
                  <span className="material-symbols-outlined text-[14px]">
                    {sortField === "email"
                      ? sortDirection === "asc"
                        ? "arrow_upward"
                        : "arrow_downward"
                      : "unfold_more"}
                  </span>
                </button>
              </th>

              {/* Role Column */}
              <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <button
                  onClick={() => handleSort("role")}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  Role
                  <span className="material-symbols-outlined text-[14px]">
                    {sortField === "role"
                      ? sortDirection === "asc"
                        ? "arrow_upward"
                        : "arrow_downward"
                      : "unfold_more"}
                  </span>
                </button>
              </th>

              {/* Status Column */}
              <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <button
                  onClick={() => handleSort("status")}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  Status
                  <span className="material-symbols-outlined text-[14px]">
                    {sortField === "status"
                      ? sortDirection === "asc"
                        ? "arrow_upward"
                        : "arrow_downward"
                      : "unfold_more"}
                  </span>
                </button>
              </th>

              {/* Last Login Column */}
              <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-400 hidden md:table-cell">
                <button
                  onClick={() => handleSort("last_login")}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  Last Login
                  <span className="material-symbols-outlined text-[14px]">
                    {sortField === "last_login"
                      ? sortDirection === "asc"
                        ? "arrow_upward"
                        : "arrow_downward"
                      : "unfold_more"}
                  </span>
                </button>
              </th>

              {/* Actions Column */}
              <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-400 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {users.map((user) => (
              <UserTableRow
                key={user._id}
                user={user}
                isSelected={selectedUsers.includes(user._id)}
                onSelect={() => handleSelectUser(user._id)}
                onEdit={() => onEditUser(user)}
                onViewDetails={() => onViewDetails(user)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <UserPagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        itemsPerPage={pagination.itemsPerPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default UserTable;
