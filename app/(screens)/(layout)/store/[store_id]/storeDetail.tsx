"use client";
import { useEffect, useState } from "react";
import {
  BiBadge,
  BiEdit,
  BiHome,
} from "react-icons/bi";
import {
  MdAccountCircle,
  MdContactMail,
  MdUpdate,
} from "react-icons/md";
import { BsFillCalendarMonthFill } from "react-icons/bs";
import Link from "next/link";
import NoData from "@/app/NoData";
import { formatDateTime } from "@/app/utils/helper";
import UpdateStatusPopup from "@/app/components/common/UpdateStatusPopupProps";
import { getStatusBadge } from "@/app/components/common/GetStatus";
import { useGetStoreQuery, useUpdateStoreMutation, useToggleStoreStatusMutation } from "../../../../services/storeApi";
import { useToast } from "../../../../hooks/useToast";
import { StatusBadge } from "../../../../components/common/StatusBadge";
import { StoreUpdateData } from "@/app/types/store";
import { StoreDetailSkeleton } from "@/app/loading/store";
import { EditStoreDetails } from "@/app/components/store";

const StoreDetail = ({ store_id }: { store_id: string }) => {
  const toast = useToast();
  const { data, isLoading, isError } = useGetStoreQuery(store_id);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false);

  const store = data?.data;

  const [updateStore] = useUpdateStoreMutation();

  const handleSubmit = async (formData: StoreUpdateData) => {
    try {
      await updateStore({ storeId: store_id, data: formData }).unwrap();
      toast.success("Store details updated");
      setShowEditModal(false);
    } catch {
      toast.error("Failed to update store");
    }
  };

  const [updateStoreStatus] = useToggleStoreStatusMutation();
  const handleUpdateStatus = async (
    status: string,
    reason: string,
    is_active: boolean
  ) => {
    try {
      await updateStoreStatus({ storeId: store_id, status }).unwrap();
      toast.success("Store status updated");
      setShowUpdateStatusModal(false);
    } catch {
      toast.error("Failed to update status");
    }
  };

  if (isLoading) return <StoreDetailSkeleton />;
  if (isError || !store) return <NoData />;

  return (
    <div className="flex h-screen flex-col bg-background text-foreground relative">
      <div className="flex flex-col max-w-[1200px] flex-1 min-h-0 px-6 py-5">
        <div className="flex gap-2 px-4 py-2 mb-4">
          <Link
            className="text-[#637588] dark:text-[#92a4c9] text-[13px] font-medium leading-normal flex items-center gap-1 hover:text-primary"
            href="/dashboard"
          >
            <span className="material-symbols-outlined text-sm">
              <BiHome />
            </span>{" "}
            Home
          </Link>
          <span className="text-[#637588] dark:text-[#92a4c9] text-[13px] font-medium leading-normal">
            /
          </span>
          <Link
            className="text-[#637588] dark:text-[#92a4c9] text-[13px] font-medium leading-normal hover:text-primary"
            href="/store"
          >
            Store Manager
          </Link>
          <span className="text-[#637588] dark:text-[#92a4c9] text-[13px] font-medium leading-normal">
            /
          </span>
          <span className="text-[#111418] dark:text-white text-[13px] font-medium leading-normal">
            {store.store_name}
          </span>
        </div>

        <div className="flex items-center gap-2 justify-between">
          {/* Profile Header */}
          <div className="flex gap-6 items-start">
            <div className="flex items-center justify-center px-4 py-3.5 bg-[#f0f2f4] dark:bg-[#324467] rounded-full">
              <p> {store.store_name[0]}</p>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-[#111418] dark:text-white text-[32px] font-bold leading-tight">
                  {store.store_name}
                </h1>
                <span
                  className={`${
                    store.is_active
                      ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                      : "bg-red-500/20 text-red-600 dark:text-red-400"
                  } text-xs font-bold px-2 py-1 rounded-full border border-emerald-500/20 uppercase tracking-wide`}
                >
                  {store.is_active ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="text-[#637588] dark:text-[#92a4c9] text-[13px] font-normal leading-normal flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">
                  <BiBadge />
                </span>
                Store ID: {store._id}
              </p>
              <p className="text-[#637588] dark:text-[#92a4c9] text-[13px] font-normal leading-normal flex items-center gap-2 mt-1">
                <span className="material-symbols-outlined text-[18px]">
                  <BsFillCalendarMonthFill />
                </span>
                Joined {formatDateTime(store.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEditModal(true)}
              className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary hover:bg-blue-700 text-white text-sm font-bold"
            >
              <span className="material-symbols-outlined text-[20px]">
                <BiEdit />
              </span>
              <span className="truncate">Edit Profile</span>
            </button>
            <button
              onClick={() => setShowUpdateStatusModal(true)}
              className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-white dark:bg-[#232f48] border border-[#e5e7eb] dark:border-[#324467] text-[#111418] dark:text-white hover:bg-gray-50 dark:hover:bg-[#2a3855] text-sm font-bold"
            >
              <span className="material-symbols-outlined text-[20px]">
                <MdUpdate />
              </span>
              <span className="truncate">Update Status</span>
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-8 px-4 flex-1 min-h-0 overflow-y-auto mt-8">
          {/* Left Column: User Info & Stats */}
          <div className="flex flex-col gap-6">
            {/* Contact Card */}
            <div className="bg-white dark:bg-[#232f48] rounded-xl p-5 border border-[#e5e7eb] dark:border-[#324467] shadow-sm">
              <h3 className="text-[#111418] dark:text-white text-lg font-bold leading-tight mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">
                  <MdContactMail />
                </span>
                Contact Information
              </h3>

              <div className="flex flex-col gap-4">
                {/* Full Name */}
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg text-primary">
                    <MdAccountCircle size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[#637588] dark:text-[#92a4c9] text-xs font-medium uppercase tracking-wider">
                      Full Name
                    </span>
                    <span className="text-[#111418] dark:text-white font-medium text-sm">
                      {store.store_name}
                    </span>
                  </div>
                </div>
                {/* Contact Number */}
                
              </div>
            </div>

            {/* Account Details Card */}
            <div className="bg-white dark:bg-[#232f48] rounded-xl p-5 border border-[#e5e7eb] dark:border-[#324467] shadow-sm">
              <h3 className="text-[#111418] dark:text-white text-lg font-bold leading-tight mb-4 flex items-center gap-2">
                <MdAccountCircle className="text-primary" />
                Account Details
              </h3>

              <div className="space-y-4">
                {/* Account Status */}
                <div className="flex justify-between items-center py-2 border-b border-[#f0f2f4] dark:border-[#324467]">
                  <span className="text-[#637588] dark:text-[#92a4c9] text-sm">
                    Account Status
                  </span>
                  <span className="text-[#111418] capitalize  dark:text-white font-medium text-sm">
                    <StatusBadge status={store.status} />
                  </span>
                </div>
                {/* Last Active */}
                <div className="flex justify-between items-center py-2 border-b border-[#f0f2f4] dark:border-[#324467]">
                  <span className="text-[#637588] dark:text-[#92a4c9] text-sm">
                    Last Active
                  </span>
                  <span className="text-[#111418] dark:text-white font-medium text-sm">
                    {store.last_active_at
                      ? formatDateTime(store.last_active_at)
                      : "N/A"}
                  </span>
                </div>
                {/* Verified */}
                <div className="flex justify-between items-center py-2 border-b border-[#f0f2f4] dark:border-[#324467]">
                  <span className="text-[#637588] dark:text-[#92a4c9] text-sm">
                    Verified
                  </span>
                  <span
                    className={`text-sm font-medium px-2 py-1 rounded ${
                      store.isVerified
                        ? "bg-green-100 text-green-600"
                        : "bg-yellow-100 text-yellow-600"
                    }`}
                  >
                    {store.isVerified ? "Verified" : "Not Verified"}
                  </span>
                </div>
                {/* Serviceable */}
                <div className="flex justify-between items-center py-2 border-[#f0f2f4] dark:border-[#324467]">
                  <span className="text-[#637588] dark:text-[#92a4c9] text-sm">
                    Serviceable
                  </span>
                  <span
                    className={`text-sm font-medium px-2 py-1 rounded ${
                      store.is_serviceable
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {store.is_serviceable ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EditStoreDetails
        showEditModal={showEditModal}
        store={store}
        onClose={() => setShowEditModal(false)}
        handleSubmit={handleSubmit}
      />

      <UpdateStatusPopup
        is_active={store.is_active}
        show={showUpdateStatusModal}
        currentStatus={store.status}
        onClose={() => setShowUpdateStatusModal(false)}
        onSubmit={handleUpdateStatus}
      />
    </div>
  );
};

export default StoreDetail;
