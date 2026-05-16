"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MdOutlineDelete } from "react-icons/md";
import { FaStore } from "react-icons/fa";
import { DeleteConfirmationModal } from "@/app/components/common";
import NoData from "@/app/NoData";
import { useGetStoresQuery, useDeleteStoresMutation } from "../../../services/storeApi";
import { useToast } from "../../../hooks/useToast";
import { Store } from "@/app/types/store";
import { StoreSkeleton } from "@/app/loading/store";
import { StoreFilter, StoreTable } from "@/app/components/store";

function StoreClient() {
  const router = useRouter();
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });
  const [filter, setFilter] = useState({ search: "", status: "all" });
  const [selectedStore, setSelectedStore] = useState<Store[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const toast = useToast();
  const { data, isLoading, isFetching, isError } = useGetStoresQuery({
    page: pagination.page,
    limit: pagination.limit,
    search: filter.search,
    status: filter.status === "all" ? undefined : filter.status,
  });

  const [deleteStores, { isLoading: isDeleting }] = useDeleteStoresMutation();

  const handleViewStore = (store: Store) => router.push(`/store/${store._id}`);

  const handleDeleteStore = async () => {
    try {
      await deleteStores({ storeIds: selectedStore.map((u) => u._id) }).unwrap();
      toast.success("Stores successfully deactivated");
      setSelectedStore([]);
      setShowDeleteModal(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to deactivate stores");
    }
  };

  const handleFilterChange = ({ search, status }: { search: string; status: string }) => {
    setFilter({ search, status });
    setPagination((p) => ({ ...p, page: 1 }));
  };

  if (isLoading) return <StoreSkeleton />;
  if (isError) return <NoData />;

  const stores = data?.data?.stores || data?.data?.store || [];
  const paginationData = data?.data?.pagination;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background text-foreground py-4 px-6 relative">
      {/* HEADER */}
      <header className="flex flex-col gap-6 pt-6 pb-2 shrink-0">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex flex-col max-w-2xl gap-1.5">
            <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">
              Store Management
            </h1>
            <p className="text-slate-500 text-sm leading-relaxed">
              Manage and view all registered stores across the platform through an
              editorial-grade interface designed for high-level orchestration.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {selectedStore.length > 0 && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 h-10 px-4 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-sm font-medium rounded-lg transition-colors"
              >
                <MdOutlineDelete size={18} />
                Delete ({selectedStore.length})
              </button>
            )}
            <div className="bg-[#f8f9fc] border border-slate-200/60 rounded-2xl p-4 flex items-center justify-between min-w-[200px] shadow-sm">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Total Stores
                </span>
                <span className="text-2xl font-bold text-slate-900 mt-0.5">
                  {paginationData?.totalItems?.toLocaleString() ?? data?.totalRecords?.toLocaleString() ?? "0"}
                </span>
              </div>
              <div className="h-10 w-10 bg-[#1a2332] rounded-xl flex items-center justify-center text-white shadow-md ml-4">
                <FaStore size={18} />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* FILTERS */}
      <StoreFilter filter={filter} onFilterChange={handleFilterChange} />

      <div className={`flex-1 flex flex-col overflow-hidden transition-opacity duration-200 ${isFetching ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
        {stores.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-slate-400">
              <p className="text-sm">No stores found for the current filters.</p>
            </div>
          </div>
        ) : (
          <StoreTable
            store={stores}
            selectedStore={selectedStore}
            onSelectionChange={setSelectedStore}
            onViewDetails={handleViewStore}
            onDeleteClick={handleDeleteStore}
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
          count={selectedStore.length}
          modalTitle="store"
          modalDescription="This action cannot be undone."
          loading={isDeleting}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteStore}
        />
      )}
    </div>
  );
}

export default StoreClient;