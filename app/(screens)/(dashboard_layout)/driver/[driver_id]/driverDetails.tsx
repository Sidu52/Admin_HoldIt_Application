"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { fetchDriverById, setCurrentDriver } from "@/app/store/slices/driverSlice";
import { toast } from "react-hot-toast";
import LoadingSpinner from "@/app/components/common/LoadingSpinner";
import { DriverDetailHeader, DriverStats, DriverPersonalInfo, DriverContactLicense, DriverVehicleInfo, DriverRecentActivity, DriverActions } from "@/app/components/driver_management/driver-detail";
import EditDriver from "@/app/components/driver_management/EditDriver";


export default function DriverDetailPage({ driver_id }: { driver_id: string }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const { currentDriver, loading, error, operationLoading } = useAppSelector(
    (state) => state.driver
  );

  const driverId = driver_id as string;

  useEffect(() => {
    if (driverId) {
      dispatch(fetchDriverById(driverId));
    }
  }, [driverId, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      router.push("/drivers");
    }
  }, [error, router]);

  const handleEditDriver = () => {
    if (currentDriver) {
      dispatch(setCurrentDriver(currentDriver));
      // You could open a modal or navigate to edit page
      // For now, let's open edit modal
      // You can integrate this with your existing DriverEditModal
    }
  };

  const handleSuspendDriver = async () => {
    if (!currentDriver) return;
    
    try {
      // Implement suspend driver logic
      toast.success(`Driver ${currentDriver.first_name} suspended`);
    } catch (error) {
      toast.error("Failed to suspend driver");
    }
  };

  const handleGoBack = () => {
    router.push("/drivers");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!currentDriver) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Driver not found</h2>
          <button
            onClick={handleGoBack}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Back to Drivers
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-6 lg:p-10">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-6">
        <nav className="flex items-center gap-2 text-sm">
          <button
            onClick={handleGoBack}
            className="text-text-secondary hover:text-white transition-colors"
          >
            Home
          </button>
          <span className="text-text-secondary">/</span>
          <button
            onClick={handleGoBack}
            className="text-text-secondary hover:text-white transition-colors"
          >
            Driver Manager
          </button>
          <span className="text-text-secondary">/</span>
          <span className="font-medium text-white">
            {currentDriver.first_name} {currentDriver.last_name}
          </span>
        </nav>
        <DriverDetailHeader
          driver={currentDriver}
          onEdit={handleEditDriver}
          onSuspend={handleSuspendDriver}
          isLoading={operationLoading}
        />
        <DriverStats driver={currentDriver} />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-6 lg:col-span-2">
            <DriverPersonalInfo driver={currentDriver} />
            <DriverContactLicense driver={currentDriver} />
          </div>
          <div className="flex flex-col gap-6">
            <DriverVehicleInfo driver={currentDriver} />
            
            {/* Driver Actions */}
            <DriverActions 
              driver={currentDriver}
              onEdit={handleEditDriver}
              onSuspend={handleSuspendDriver}
              onViewDocuments={() => {/* Handle view documents */}}
              onSendMessage={() => {/* Handle send message */}}
            />
          </div>
        </div>

        <DriverRecentActivity driverId={driverId} />
      </div>

      {currentDriver && <EditDriver driver={currentDriver} />}
    </main>
  );
}