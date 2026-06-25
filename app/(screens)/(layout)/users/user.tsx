"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { MdOutlineDelete } from "react-icons/md";

import { UserFilters, UserTable } from "@/app/components/user";
import { DeleteConfirmationModal } from "@/app/components/common";
import UserSkeleton from "@/app/loading/user/UserSkeleton";
import NoData from "@/app/NoData";

import { User } from "@/app/types/user";
import { useGetUsersQuery, useBulkDeactivateUsersMutation } from "../../../services/userApi";
import { useToast } from "../../../hooks/useToast";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { hasControl } from "@/app/utils/role";

function UserClient() {
  const router = useRouter();
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });
  const [filter, setFilter] = useState({ search: "", account_status: "all" });
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const loggedInUser = useSelector((state: RootState) => state.auth.user);
  const canControl = hasControl(loggedInUser?.role, "users");

  const toast = useToast();
  const { data, isLoading, isFetching, isError } = useGetUsersQuery({  // ✅ add isFetching
    page: pagination.page,
    limit: pagination.limit,
    search: filter.search,
    account_status: filter.account_status === "all" ? undefined : filter.account_status,
  });

  const [bulkDeactivateUsers, { isLoading: isDeleting }] = useBulkDeactivateUsersMutation();

  const handleViewUser = (user: User) => router.push(`/users/${user._id}`);

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleDeleteUser = async () => {
    try {
      const ids = userToDelete ? [userToDelete._id] : selectedUsers.map((u) => u._id);
      await bulkDeactivateUsers({ userIds: ids }).unwrap();
      toast.success("Users successfully deactivated");
      setSelectedUsers([]);
      setUserToDelete(null);
      setShowDeleteModal(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to deactivate users");
    }
  };

  const handleFilterChange = ({ search, account_status }: { search: string; account_status: string }) => {
    setFilter({ search, account_status });
    setPagination((p) => ({ ...p, page: 1 }));
  };

  if (isLoading) return <UserSkeleton />;
  if (isError) return <NoData />;

  const users = data?.data?.users || [];
  const paginationData = data?.data?.pagination;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background text-foreground py-4 px-6 relative">
      {/* HEADER */}
      <header className="flex flex-col gap-6 pt-6 pb-2 shrink-0">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex flex-col max-w-2xl gap-1.5">
            <h1 className="text-[28px] font-bold text-slate-900 dark:text-white tracking-tight">
              User Management
            </h1>
            <p className="text-slate-500 dark:text-text-muted-dark text-sm leading-relaxed">
              Manage and view all registered users across the platform through an
              editorial-grade interface designed for high-level orchestration.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {canControl && selectedUsers.length > 0 && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 h-10 px-4 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium rounded-lg transition-colors animate-fade-in"
              >
                <MdOutlineDelete size={18} />
                Delete ({selectedUsers.length})
              </button>
            )}
            <div className="bg-[#f8f9fc] dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50 rounded-2xl p-4 flex items-center justify-between min-w-[200px] shadow-sm">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-500 dark:text-text-muted-dark uppercase tracking-widest">
                  Total Users
                </span>
                <span className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
                  {paginationData?.totalItems.toLocaleString() ?? "0"}
                </span>
              </div>
              <div className="h-10 w-10 bg-[#1a2332] rounded-xl flex items-center justify-center text-white shadow-md ml-4">
                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="20" width="20">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* FILTERS */}
      <UserFilters filter={filter} onFilterChange={handleFilterChange} />
      <div className={`flex-1 flex flex-col overflow-hidden transition-opacity duration-200 ${isFetching ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
        {users.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-slate-400">
              <p className="text-sm">No users found for the current filters.</p>
            </div>
          </div>
        ) : (
          <UserTable
            users={users}
            selectedUsers={selectedUsers}
            onSelectionChange={setSelectedUsers}
            onViewDetails={handleViewUser}
            onDeleteClick={handleDeleteClick}
            actorRole={loggedInUser?.role}
            pagination={{
              page: paginationData?.page ?? 1,
              totalPages: paginationData?.totalPages ?? 1,
            }}
            onPageChange={(page) => setPagination((p) => ({ ...p, page }))}
          />
        )}
      </div>

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <DeleteConfirmationModal
          count={userToDelete ? 1 : selectedUsers.length}
          modalTitle="user"
          modalDescription="This action cannot be undone."
          loading={isDeleting}
          onClose={() => {
            setShowDeleteModal(false);
            setUserToDelete(null);
          }}
          onConfirm={handleDeleteUser}
        />
      )}
    </div>
  );
}

export default UserClient;