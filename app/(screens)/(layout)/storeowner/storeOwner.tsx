"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MdOutlineDelete } from "react-icons/md";
import { FaUserTie } from "react-icons/fa";
import { DeleteConfirmationModal } from "@/app/components/common";
import NoData from "@/app/NoData";
import { useGetStoreOwnersQuery, useDeleteStoreOwnersMutation } from "../../../services/storeOwnerApi";
import { useToast } from "../../../hooks/useToast";
import { StoreOwner } from "@/app/types/storeOwner";
import { StoreOwnerSkeleton } from "@/app/loading/storeOwner";
import { StoreOwnerFilter, StoreOwnerTable } from "@/app/components/store_owner";

function StoreOwnerClient() {
  const router = useRouter();
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });
  const [filter, setFilter] = useState({ search: "", account_status: "all" });
  const [selectedStoreOwner, setSelectedStoreOwner] = useState<StoreOwner[]>([]);
  const [ownerToDelete, setOwnerToDelete] = useState<StoreOwner | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const toast = useToast();
  const { data, isLoading, isFetching, isError } = useGetStoreOwnersQuery({
    page: pagination.page,
    limit: pagination.limit,
    search: filter.search,
    account_status: filter.account_status === "all" ? undefined : filter.account_status,
  });

  const [deleteStoreOwners, { isLoading: isDeleting }] = useDeleteStoreOwnersMutation();

  const handleViewStoreOwner = (storeOwner: StoreOwner) => router.push(`/storeowner/${storeOwner._id}`);

  const handleDeleteClick = (owner: StoreOwner) => {
    setOwnerToDelete(owner);
    setShowDeleteModal(true);
  };

  const handleDeleteStoreOwner = async () => {
    try {
      const ids = ownerToDelete ? [ownerToDelete._id] : selectedStoreOwner.map((u) => u._id);
      await deleteStoreOwners({ ownerIds: ids }).unwrap();
      toast.success("Store owners successfully deactivated");
      setSelectedStoreOwner([]);
      setOwnerToDelete(null);
      setShowDeleteModal(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to deactivate store owners");
    }
  };

  const handleFilterChange = ({ search, account_status }: { search: string; account_status: string }) => {
    setFilter({ search, account_status });
    setPagination((p) => ({ ...p, page: 1 }));
  };

  if (isLoading) return <StoreOwnerSkeleton />;
  if (isError) return <NoData />;

  const storeOwners = data?.data?.owners || [];
  const paginationData = data?.data?.pagination;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background text-foreground py-4 px-6 relative">
      {/* HEADER */}
      <header className="flex flex-col gap-6 pt-6 pb-2 shrink-0">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex flex-col max-w-2xl gap-1.5">
            <h1 className="text-[28px] font-bold text-slate-900 dark:text-white tracking-tight">
              Store Owner Management
            </h1>
            <p className="text-slate-500 dark:text-text-muted-dark text-sm leading-relaxed">
              Manage and view all registered store owners across the platform through an
              editorial-grade interface designed for high-level orchestration.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {selectedStoreOwner.length > 0 && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 h-10 px-4 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium rounded-lg transition-colors animate-fade-in"
              >
                <MdOutlineDelete size={18} />
                Delete ({selectedStoreOwner.length})
              </button>
            )}
            <div className="bg-[#f8f9fc] dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50 rounded-2xl p-4 flex items-center justify-between min-w-[200px] shadow-sm">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-500 dark:text-text-muted-dark uppercase tracking-widest">
                  Total Owners
                </span>
                <span className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
                  {paginationData?.totalItems?.toLocaleString() ?? data?.totalRecords?.toLocaleString() ?? "0"}
                </span>
              </div>
              <div className="h-10 w-10 bg-[#1a2332] rounded-xl flex items-center justify-center text-white shadow-md ml-4">
                <FaUserTie size={18} />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* FILTERS */}
      <StoreOwnerFilter filter={filter} onFilterChange={handleFilterChange} />

      <div className={`flex-1 flex flex-col overflow-hidden transition-opacity duration-200 ${isFetching ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
        {storeOwners.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-slate-400">
              <p className="text-sm">No store owners found for the current filters.</p>
            </div>
          </div>
        ) : (
          <StoreOwnerTable
            store_owner={storeOwners}
            selectedStoreOwners={selectedStoreOwner}
            onSelectionChange={setSelectedStoreOwner}
            onViewDetails={handleViewStoreOwner}
            onDeleteClick={handleDeleteClick}
            pagination={{
              page: paginationData?.page ?? 1,
              totalPages: paginationData?.totalPages ?? 1,
            }}
            onPageChange={(page: number) => setPagination((p) => ({ ...p, page }))}
          />
        )}
      </div>

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <DeleteConfirmationModal
          count={ownerToDelete ? 1 : selectedStoreOwner.length}
          modalTitle="store owner"
          modalDescription="This action cannot be undone."
          loading={isDeleting}
          onClose={() => {
            setShowDeleteModal(false);
            setOwnerToDelete(null);
          }}
          onConfirm={handleDeleteStoreOwner}
        />
      )}
    </div>
  );
}

export default StoreOwnerClient;
