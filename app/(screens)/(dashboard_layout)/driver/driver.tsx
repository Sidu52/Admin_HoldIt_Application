"use client";

import React, { useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import {
  fetchDrivers,
  updateMultipleDriverStatus,
  deleteDrivers,
  selectDriver,
  selectAllDrivers,
  clearSelectedDrivers,
  updateFilter,
  clearFilters,
  setPage,
  setCurrentDriver,
  clearError,
  clearSuccessMessage,
} from "@/app/store/slices/driverSlice";
import toast from "react-hot-toast";
import { DriverHeader, DriverFilters, DriverTable, DriverEditModal, DeleteConfirmationModal, StatusUpdateModal } from '@/app/components/driver_management';
import Pagination from "@/app/components/common/Pagination";


const DriverManager: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const {
    drivers,
    selectedDrivers,
    currentDriver,
    pagination,
    filters,
    loading,
    error,
    successMessage,
    operationLoading,
    operationError,
  } = useAppSelector((state) => state.driver);

  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [showStatusModal, setShowStatusModal] = React.useState(false);
  const [selectedStatus, setSelectedStatus] = React.useState<string>("");

  // Fetch drivers when filters or pagination changes
  useEffect(() => {
    dispatch(
      fetchDrivers({
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        ...filters,
      })
    );
  }, [dispatch, pagination.currentPage, pagination.itemsPerPage, filters]);

  // Handle errors and success messages
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
    
    if (operationError) {
      toast.error(operationError);
      dispatch(clearError());
    }
    
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearSuccessMessage());
    }
  }, [error, operationError, successMessage, dispatch]);

  const handleSelectDriver = useCallback((id: string) => {
    dispatch(selectDriver(id));
  }, [dispatch]);

  const handleSelectAll = useCallback(() => {
    dispatch(selectAllDrivers());
  }, [dispatch]);

  const handleDeleteSelected = async () => {
    if (selectedDrivers.length === 0) return;
    
    try {
      await dispatch(deleteDrivers(selectedDrivers)).unwrap();
      setShowDeleteModal(false);
      toast.success(`${selectedDrivers.length} driver(s) deleted successfully`);
    } catch (error) {
      toast.error("Failed to delete drivers");
    }
  };

  const handleStatusUpdate = async (status: string) => {
    if (selectedDrivers.length === 0) return;
    
    try {
      await dispatch(
        updateMultipleDriverStatus({ ids: selectedDrivers, status })
      ).unwrap();
      setShowStatusModal(false);
      toast.success(`Status updated for ${selectedDrivers.length} driver(s)`);
    } catch (error) {
      toast.error("Failed to update driver status");
    }
  };

  const handleSearch = useCallback((value: string) => {
    dispatch(updateFilter({ search: value }));
  }, [dispatch]);

  const handleFilterChange = useCallback((key: keyof typeof filters, value: any) => {
    dispatch(updateFilter({ [key]: value }));
  }, [dispatch]);

  const handlePageChange = useCallback((page: number) => {
    dispatch(setPage(page));
  }, [dispatch]);

  const handleEditDriver = useCallback((driver: any) => {
    dispatch(setCurrentDriver(driver));
  }, [dispatch]);

  const handleCloseEdit = useCallback(() => {
    dispatch(setCurrentDriver(null));
  }, [dispatch]);

  const handleDriverUpdated = useCallback(() => {
    // Refetch drivers to get updated data
    dispatch(
      fetchDrivers({
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        ...filters,
      })
    );
    dispatch(setCurrentDriver(null));
    toast.success("Driver updated successfully");
  }, [dispatch, pagination, filters]);

  const handleClearFilters = useCallback(() => {
    dispatch(clearFilters());
  }, [dispatch]);

  const handleClearSelected = useCallback(() => {
    dispatch(clearSelectedDrivers());
  }, [dispatch]);

  const totalPages = useMemo(() => {
    return pagination.totalPages;
  }, [pagination.totalPages]);

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-dark relative">
      {/* Header Section */}
      <DriverHeader
        selectedCount={selectedDrivers.length}
        onAddDriver={() => {/* Open add driver modal */}}
        onDeleteSelected={() => setShowDeleteModal(true)}
        onUpdateStatus={(status) => {
          setSelectedStatus(status);
          setShowStatusModal(true);
        }}
        onClearSelected={handleClearSelected}
        isLoading={operationLoading}
      />

      {/* Search & Filters Toolbar */}
      <DriverFilters
        filters={filters}
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      {/* Table Container */}
      <div className="flex-1 overflow-hidden px-6 pb-6">
        <div className="flex flex-col h-full bg-surface-dark border border-surface-border rounded-xl shadow-sm overflow-hidden">
          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="text-white">Loading drivers...</div>
            </div>
          )}

          {/* Table */}
          <div className="flex-1 overflow-auto">
            <DriverTable
              drivers={drivers}
              isLoading={loading}
              selectedDrivers={selectedDrivers}
              onSelectDriver={handleSelectDriver}
              onSelectAll={handleSelectAll}
              onEditDriver={handleEditDriver}
              onViewDetails={(driver) => {
                router.push(`/dashboard/drivers/${driver._id}`);
              }}
            />
          </div>

          {/* Pagination */}
          {!loading && drivers.length > 0 && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              siblingCount={1}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteSelected}
        count={selectedDrivers.length}
        isLoading={operationLoading}
      />

      <StatusUpdateModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        onConfirm={handleStatusUpdate}
        currentStatus={selectedStatus}
        count={selectedDrivers.length}
        isLoading={operationLoading}
      />

      {currentDriver && (
        <DriverEditModal
          driver={currentDriver}
          isOpen={!!currentDriver}
          onClose={handleCloseEdit}
          onSuccess={handleDriverUpdated}
        />
      )}
    </main>
  );
};

export default DriverManager;