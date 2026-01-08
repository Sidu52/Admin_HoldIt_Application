"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { MdOutlineDelete } from "react-icons/md";

import { UserFilters, UserTable } from "@/app/components/user";
import { DeleteConfirmationModal } from "@/app/components/common";
import UserSkeleton from "@/app/loading/user/UserSkeleton";
import NoData from "@/app/NoData";

import { User } from "@/app/types/user";
import { useDeleteUsers, useUsersQuery } from "@/app/react_queries/users";

function UserClient() {
  const router = useRouter();
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
  });

  const [filter, setFilter] = useState({
    search: "",
    status: "all",
  });

  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data, isLoading, isError } = useUsersQuery({
    page: pagination.page,
    limit: pagination.limit,
    search: filter.search,
    status: filter.status === "all" ? undefined : filter.status,
  });

  const deleteUsersMutation = useDeleteUsers();

  // ---------------- HANDLERS ----------------
  const handleViewUser = (user: User) => {
    router.push(`/users/${user._id}`);
  };

  const handleDeleteUser = () => {
    deleteUsersMutation.mutate(
      selectedUsers.map((u) => u._id),
      {
        onSuccess: () => {
          setSelectedUsers([]);
          setShowDeleteModal(false);
        },
      }
    );
  };

  const handleFilterChange = ({
    search,
    status,
  }: {
    search: string;
    status: string;
  }) => {
    setFilter({ search, status });
    setPagination((p) => ({ ...p, page: 1 }));
  };

  // ---------------- UI STATES ----------------
  if (isLoading) return <UserSkeleton />;
  if (isError || !data) return <NoData />;

  const users = data.data.users || [];

  // ---------------- RENDER ----------------
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background text-foreground py-4 px-6 relative">
      {/* HEADER */}
      <header className="flex flex-col gap-6 pt-8 pb-4 shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              User Management
            </h1>

            <p className="text-secondary text-base">
              Manage and view all registered users across the platform.
            </p>

            <div className="flex items-center gap-4 mt-2">
              <span className="text-sm">
                Total Users:{" "}
                <b className="text-foreground">{data.totalRecords}</b>
              </span>
            </div>
          </div>

          {selectedUsers.length > 0 && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 h-9 px-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-medium rounded-lg"
              >
                <MdOutlineDelete size={18} />
                Delete ({selectedUsers.length})
              </button>
            </div>
          )}
        </div>
      </header>

      {/* FILTERS */}
      <UserFilters filter={filter} onFilterChange={handleFilterChange} />

      {/* TABLE */}
      <UserTable
        users={users}
        selectedUsers={selectedUsers}
        onSelectionChange={setSelectedUsers}
        onViewDetails={handleViewUser}
        onDeleteClick={handleDeleteUser}
        pagination={{
          page: data.data.pagination.page,
          totalPages: data.data.pagination.totalPages,
        }}
        onPageChange={(page) => setPagination((p) => ({ ...p, page }))}
      />

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <DeleteConfirmationModal
          count={selectedUsers.length}
          modalTitle="user"
          modalDescription="This action cannot be undone. All associated data will be permanently removed."
          loading={deleteUsersMutation.isPending}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteUser}
        />
      )}
    </div>
  );
}

export default UserClient;
