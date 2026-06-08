"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MdOutlineDelete } from "react-icons/md";
import { FaTruck } from "react-icons/fa";
import { DeleteConfirmationModal } from "@/app/components/common";
import NoData from "@/app/NoData";
import { Driver } from "@/app/types/driver";
import { useGetDriversQuery, useBulkDeactivateDriversMutation } from "../../../services/driverApi";
import { useToast } from "../../../hooks/useToast";
import { DriverSkeleton } from "@/app/loading/driver";
import { DriverFilter, DriverTable } from "@/app/components/driver";
import { useSocket } from "@/app/hooks/useSocket";
import { useDispatch } from "react-redux";
import { api } from "../../../services/api";

function DriverClient() {
  const router = useRouter();
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });
  const [filter, setFilter] = useState({ search: "", account_status: "all" });
  const [selectedDriver, setSelectedDriver] = useState<Driver[]>([]);
  const [driverToDelete, setDriverToDelete] = useState<Driver | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const dispatch = useDispatch();

  useSocket("admin:driver:status_changed", () => {
    dispatch(api.util.invalidateTags([{ type: "Driver", id: "PARTIAL-LIST" }]));
  });

  const toast = useToast();
  const { data, isLoading, isFetching, isError } = useGetDriversQuery({
    page: pagination.page,
    limit: pagination.limit,
    search: filter.search,
    status: filter.account_status === "all" ? undefined : filter.account_status,
  });

  const [bulkDeactivateDrivers, { isLoading: isDeleting }] = useBulkDeactivateDriversMutation();

  const handleViewDriver = (driver: Driver) => router.push(`/drivers/${driver._id}`);

  const handleDeleteClick = (driver: Driver) => {
    setDriverToDelete(driver);
    setShowDeleteModal(true);
  };

  const handleDeleteDriver = async () => {
    try {
      const ids = driverToDelete ? [driverToDelete._id] : selectedDriver.map((u) => u._id);
      await bulkDeactivateDrivers({ driverIds: ids }).unwrap();
      toast.success("Drivers successfully deactivated");
      setSelectedDriver([]);
      setDriverToDelete(null);
      setShowDeleteModal(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to deactivate drivers");
    }
  };

  const handleFilterChange = ({ search, account_status }: { search: string; account_status: string }) => {
    setFilter({ search, account_status });
    setPagination((p) => ({ ...p, page: 1 }));
  };

  if (isLoading) return <DriverSkeleton />;
  if (isError) return <NoData />;

  const drivers = data?.data?.drivers || [];
  const paginationData = data?.data?.pagination;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark p-8">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
              <FaTruck className="text-xl" />
            </div>
            <h1 className="text-4xl font-extrabold font-display tracking-tight text-text-main-light dark:text-text-main-dark">
              Driver Management
            </h1>
          </div>
          <p className="text-text-muted-light dark:text-text-muted-dark font-medium tracking-wide">
            Oversee and manage your delivery fleet across all operations.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {selectedDriver.length > 0 && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 h-12 px-6 bg-rose-500/10 text-rose-600 border border-rose-500/20 text-sm font-bold rounded-2xl transition-all hover:bg-rose-500/20 active:scale-95"
            >
              <MdOutlineDelete size={20} />
              Deactivate ({selectedDriver.length})
            </button>
          )}

          <div className="card-premium py-3 px-6 flex items-center gap-4 bg-surface-light dark:bg-surface-dark border-none shadow-premium/5">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-text-muted-light uppercase tracking-widest leading-none mb-1">
                Active Fleet
              </span>
              <span className="text-2xl font-extrabold font-display text-text-main-light dark:text-text-main-dark leading-none">
                {paginationData?.totalItems?.toLocaleString() ?? "0"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* FILTERS */}
      <div className="mb-6">
        <DriverFilter filter={filter} onFilterChange={handleFilterChange} />
      </div>

      <div className={`flex-1 flex flex-col overflow-hidden transition-opacity duration-300 ${isFetching ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
        {drivers.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm font-bold text-text-muted-light uppercase tracking-widest">No drivers found</p>
          </div>
        ) : (
          <DriverTable
            driver={drivers}
            selectedDrivers={selectedDriver}
            onSelectionChange={setSelectedDriver}
            onViewDetails={handleViewDriver}
            onDeleteClick={handleDeleteClick}
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
          count={driverToDelete ? 1 : selectedDriver.length}
          modalTitle="driver"
          modalDescription="This action will deactivate the selected driver accounts."
          loading={isDeleting}
          onClose={() => {
            setShowDeleteModal(false);
            setDriverToDelete(null);
          }}
          onConfirm={handleDeleteDriver}
        />
      )}
    </div>
  );
}

export default DriverClient;
