
"use client";
import React, { useEffect, useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks/useUserStore";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  fetchUsersThunk,
  updateMultipleUserStatusThunk,
  deleteUsersThunk,
} from "@/app/store/thunks/userThunks";
import {
  UserFilters,
  UserHeader,
  UserTable,
} from "@/app/components/user_management";
import {
  DeleteConfirmationModal,
  StatusUpdateModal,
} from "@/app/components/common";
import { User } from "@/app/types/usermanager";
import { clearSelectedUsers, setCurrentUser, updateFilter } from "@/app/store/slices/userSlice";

function UserManager() {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [showStatusModal, setShowStatusModal] = React.useState(false);
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [selectedStatus, setSelectedStatus] = React.useState<string>("");

  const dispatch = useAppDispatch();
  const {
    users,
    selectedUsers,
    currentUser,
    pagination,
    filters,
    loading,
    error,
    successMessage,
    operationLoading,
    operationError,
  } = useAppSelector((state) => state.user);
  const totalUsers = users.length;
  const activeUsers = users.filter((user) => user.status === "active").length;

  // Fetch users when filters or pagination changes
  useEffect(() => {
    dispatch(
      fetchUsersThunk({
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        ...filters,
      })
    );
  }, [filters.search, filters.status, dispatch]);

  // Handle errors and success messages
  useEffect(() => {
    if (error) {
      toast.error(error);
    }

    if (operationError) {
      toast.error(operationError);
    }

    if (successMessage) {
      toast.success(successMessage);
    }
  }, [error, operationError, successMessage]);

  const handleSearch = useCallback(
    (value: string) => {
      dispatch(updateFilter({ search: value }));
    },
    [dispatch]
  );

  const handleFilterChange = useCallback(
    (value: any) => {
      dispatch(updateFilter({ status: value }));
    },
    [dispatch]
  );

  const handleCreateUser = useCallback(() => {
    setShowCreateModal(true);
  }, []);

  const handleDeleteSelected = async () => {
    if (selectedUsers.length === 0) return;

    try {
      await dispatch(deleteUsersThunk(selectedUsers)).unwrap();
      setShowDeleteModal(false);
      toast.success(`${selectedUsers.length} user(s) deleted successfully`);
    } catch (error) {
      toast.error("Failed to delete users");
    }
  };

  const handleClearSelected = useCallback(() => {
    dispatch(clearSelectedUsers());
  }, [dispatch]);

  // Handle user status update
  const handleEditUser = useCallback(
    (user: User) => {
      dispatch(setCurrentUser(user));
    },
    [dispatch]
  );

  const handleCloseEdit = useCallback(() => {
    dispatch(setCurrentUser(null));
  }, [dispatch]);

  const handleStatusUpdate = async () => {
    if (selectedUsers.length === 0) return;
    try {
      await dispatch(
        updateMultipleUserStatusThunk({ ids: selectedUsers, status: selectedStatus })
      ).unwrap();
      setShowStatusModal(false);
      toast.success(`Status updated for ${selectedUsers.length} user(s)`);
    } catch (error) {
      toast.error("Failed to update user status");
    }
  };

  console.log("filter", filters);
  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-dark relative">
      {/* Header Section */}
      <UserHeader
        selectedCount={selectedUsers.length}
        onAddUser={handleCreateUser}
        onDeleteSelected={() => setShowDeleteModal(true)}
        onUpdateStatus={(status) => {
          setSelectedStatus(status);
          setShowStatusModal(true);
        }}
        onClearSelected={handleClearSelected}
        isLoading={operationLoading}
        totalUsers={totalUsers}
        activeUsers={activeUsers}
      />
      {/* Search & Filters Toolbar */}
      <UserFilters
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
      />

      {/* Table Container */}
      <div className="flex-1 overflow-hidden px-6 pb-6">
        <div className="flex flex-col h-full bg-surface-dark border border-surface-border rounded-xl shadow-sm overflow-hidden">
          {/* Table */}
          <div className="flex-1 overflow-auto">
            <UserTable
              filters={filters}
              onEditUser={handleEditUser}
              onViewDetails={(user) => {
                router.push(`/users/${user._id}`);
              }}
            />
          </div>
        </div>
      </div>
      <DeleteConfirmationModal
        modalTitle="user"
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteSelected}
        count={selectedUsers.length}
        isLoading={operationLoading}
      />
      <StatusUpdateModal
        isOpen={showStatusModal}
        selectedStatus={selectedStatus}
        setSelectedStatus={(status) => setSelectedStatus(status)}
        onClose={() => setShowStatusModal(false)}
        onConfirm={handleStatusUpdate}
        isLoading={operationLoading}
      />
      {/* {currentUser && (
        <UserEditModal
          user={currentUser}
          isOpen={!!currentUser}
          onClose={handleCloseEdit}
          onSuccess={handleUserUpdated}
        />
      )} */}
      {/* {showCreateModal && (
        <CreateUserModal
          isOpen={showCreateModal}
          onClose={handleCloseCreateModal}
          onSuccess={handleUserCreated}
        />
      )} */}
    </main>
  );
}

export default UserManager;

//   const handleUserUpdated = useCallback(() => {
//     // Refetch users to get updated data
//     dispatch(
//       fetchUsers({
//         page: pagination.currentPage,
//         limit: pagination.itemsPerPage,
//         ...filters,
//       })
//     );
//     dispatch(setCurrentUser(null));
//     toast.success("User updated successfully");
//   }, [dispatch, pagination, filters]);

//   const handleClearFilters = useCallback(() => {
//     dispatch(clearFilters());
//   }, [dispatch]);

//   const handleCloseCreateModal = useCallback(() => {
//     setShowCreateModal(false);
//   }, []);

//   const handleUserCreated = useCallback(() => {
//     setShowCreateModal(false);
//     // Refetch users
//     dispatch(
//       fetchUsers({
//         page: pagination.currentPage,
//         limit: pagination.itemsPerPage,
//         ...filters,
//       })
//     );
//     toast.success("User created successfully");
//   }, [dispatch, pagination, filters]);

//   const handleImportUsers = () => {
//     // Open import modal or file input
//     const input = document.createElement("input");
//     input.type = "file";
//     input.accept = ".csv,.xlsx,.xls";
//     input.onchange = async (e) => {
//       const file = (e.target as HTMLInputElement).files?.[0];
//       if (file) {
//         try {
//           const result = await usersApi.uploadUsers(file);
//           toast.success(`Successfully imported ${result.success} users`);
//           // Refresh user list
//           dispatch(
//             fetchUsers({
//               /* params */
//             })
//           );
//         } catch (error) {
//           toast.error("Failed to import users");
//         }
//       }
//     };
//     input.click();
//   };

//   const totalPages = useMemo(() => {
//     return pagination.totalPages;
//   }, [pagination.totalPages]);

//   return (
//     <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-dark relative">
//       {/* Header Section */}
//       // In the render method

//
//
//       {/* Table Container */}
//       <div className="flex-1 overflow-hidden px-6 pb-6">
//         <div className="flex flex-col h-full bg-surface-dark border border-surface-border rounded-xl shadow-sm overflow-hidden">
//           {/* Loading Overlay */}
//           {loading && (
//             <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10">
//               <div className="text-white">Loading users...</div>
//             </div>
//           )}

//           {/* Table */}
//           <div className="flex-1 overflow-auto">
//             <UserTable
//               users={users}
//               isLoading={loading}
//               selectedUsers={selectedUsers}
//               onSelectUser={handleSelectUser}
//               onSelectAll={handleSelectAll}
//               onEditUser={handleEditUser}
//               onViewDetails={(user) => {
//                 // Navigate to user details
//                 console.log("View details:", user);
//               }}
//             />
//           </div>

//           {/* Pagination */}
//           {!loading && users.length > 0 && (
//             <Pagination
//               currentPage={pagination.currentPage}
//               totalPages={totalPages}
//               onPageChange={handlePageChange}
//               siblingCount={1}
//             />
//           )}
//         </div>
//       </div>
//       {/* Modals */}
//       <DeleteConfirmationModal
//         isOpen={showDeleteModal}
//         onClose={() => setShowDeleteModal(false)}
//         onConfirm={handleDeleteSelected}
//         count={selectedUsers.length}
//         isLoading={operationLoading}
//       />

//     </main>
//   );
// };

// export default UserManager;
