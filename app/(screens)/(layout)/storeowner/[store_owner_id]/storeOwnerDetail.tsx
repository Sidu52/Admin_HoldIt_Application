"use client";
import { useEffect, useState } from "react";
import {
  BiBadge,
  BiBlock,
  BiCheckCircle,
  BiEdit,
  BiHome,
} from "react-icons/bi";
import {
  MdAccountCircle,
  MdCake,
  MdContactMail,
  MdLocationOn,
  MdMail,
  MdPhoneCallback,
  MdUpdate,
  MdWc,
} from "react-icons/md";
import { BsFillCalendarMonthFill } from "react-icons/bs";
import Link from "next/link";
import NoData from "@/app/NoData";
import { formatDateTime } from "@/app/utils/helper";
import UpdateStatusPopup from "@/app/components/common/UpdateStatusPopupProps";
import { getStatusBadge } from "@/app/components/common/GetStatus";
import { useGetStoreOwnerQuery, useUpdateStoreOwnerMutation, useUpdateStoreOwnerStatusMutation } from "../../../../services/storeOwnerApi";
import { useToast } from "../../../../hooks/useToast";
import { StatusBadge } from "../../../../components/common/StatusBadge";
import { StoreOwner, StoreOwnerUpdateData } from "@/app/types/storeOwner";
import { StoreOwnerProfileDetailSkeleton } from "@/app/loading/storeOwner";
import { EditStoreOwnerDetails } from "@/app/components/store_owner";
import { VERIFICATION_STATUS } from "@/app/enum";

const storeOwnerDetail = ({ store_owner_id }: { store_owner_id: string }) => {
  const toast = useToast();
  const { data, isLoading, isError } = useGetStoreOwnerQuery(store_owner_id);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false);

  const store_owner: StoreOwner = data?.data;

  const [updateStoreOwner] = useUpdateStoreOwnerMutation();

  const handleSubmit = async (formData: StoreOwnerUpdateData) => {
    try {
      await updateStoreOwner({ ownerId: store_owner_id, data: formData }).unwrap();
      toast.success("Store owner details updated");
      setShowEditModal(false);
    } catch {
      toast.error("Failed to update store owner");
    }
  };

  const [updateStoreOwnerStatus] = useUpdateStoreOwnerStatusMutation();
  const handleUpdateStatus = async (
    account_status: string,
    reason: string,
  ) => {
    try {
      await updateStoreOwnerStatus({ ownerId: store_owner_id, account_status, account_deactivated_reason: reason }).unwrap();
      toast.success("Status updated successfully");
      setShowUpdateStatusModal(false);
    } catch {
      toast.error("Failed to update status");
    }
  };

  if (isLoading) return <StoreOwnerProfileDetailSkeleton />;
  if (isError || !store_owner) return <NoData />;

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
            href="/storeowner"
          >
            Store Owner Manager
          </Link>
          <span className="text-[#637588] dark:text-[#92a4c9] text-[13px] font-medium leading-normal">
            /
          </span>
          <span className="text-[#111418] dark:text-white text-[13px] font-medium leading-normal">
            {store_owner?.first_name} {store_owner?.last_name}
          </span>
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center">
            <div className="flex items-center justify-center h-14 w-14 shrink-0 bg-[#f0f2f4] dark:bg-[#324467] rounded-full font-bold">
              <p> {store_owner?.first_name?.[0] + store_owner?.last_name?.[0]}</p>
            </div>
            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-[#111418] dark:text-white text-2xl sm:text-[32px] font-bold leading-tight">
                  {store_owner?.first_name} {store_owner?.last_name}
                </h1>
                <span className="text-xs font-bold px-2 py-1 rounded-full  uppercase tracking-wide">
                  <StatusBadge account_status={store_owner?.account_status} />
                </span>
              </div>
              <p className="text-[#637588] dark:text-[#92a4c9] text-[13px] font-normal leading-normal flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">
                  <BiBadge />
                </span>
                Store Owner ID: {store_owner?._id}
              </p>
              <p className="text-[#637588] dark:text-[#92a4c9] text-[13px] font-normal leading-normal flex items-center gap-2 mt-1">
                <span className="material-symbols-outlined text-[18px]">
                  <BsFillCalendarMonthFill />
                </span>
                Joined {formatDateTime(store_owner?.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
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
                      {store_owner.first_name} {store_owner.last_name}
                    </span>
                  </div>
                </div>
                {/* Email */}
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg text-primary">
                    <MdMail size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[#637588] dark:text-[#92a4c9] text-xs font-medium uppercase tracking-wider">
                      Email Address
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[#111418] dark:text-white font-medium text-sm">
                        {store_owner.email}
                      </span>
                      <span
                        className="material-symbols-outlined text-emerald-500 text-[16px]"
                        title="Verified"
                      >
                        <BiCheckCircle />
                      </span>
                    </div>
                  </div>
                </div>
                {/* Phone */}
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg text-primary">
                    <MdPhoneCallback size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[#637588] dark:text-[#92a4c9] text-xs font-medium uppercase tracking-wider">
                      Phone
                    </span>
                    <span className="text-[#111418] dark:text-white font-medium text-sm">
                      {store_owner?.phone}
                    </span>
                  </div>
                </div>
                {/* Gender */}
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg text-primary">
                    <MdWc size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[#637588] dark:text-[#92a4c9] text-xs font-medium uppercase tracking-wider">
                      Gender
                    </span>
                    <span className="text-[#111418] dark:text-white font-medium text-sm">
                      {store_owner.gender || "Not specified"}
                    </span>
                  </div>
                </div>
                {/* Date of Birth */}
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg text-primary">
                    <MdCake size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[#637588] dark:text-[#92a4c9] text-xs font-medium uppercase tracking-wider">
                      Date of Birth
                    </span>
                    <span className="text-[#111418] dark:text-white font-medium text-sm">
                      {formatDateTime(store_owner.date_of_birth, "date")}
                    </span>
                  </div>
                </div>
                {/* Address */}
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg text-primary">
                    <MdLocationOn size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[#637588] dark:text-[#92a4c9] text-xs font-medium uppercase tracking-wider">
                      Address
                    </span>
                    <span className="text-[#111418] dark:text-white font-medium text-sm">
                      {store_owner.address || "Not provided"}
                    </span>
                  </div>
                </div>
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
                    <StatusBadge account_status={store_owner.account_status} />
                  </span>
                </div>

                {/* Last Login */}
                <div className="flex justify-between items-center py-2 border-b border-[#f0f2f4] dark:border-[#324467]">
                  <span className="text-[#637588] dark:text-[#92a4c9] text-sm">
                    Last Login
                  </span>
                  <span className="text-[#111418] dark:text-white font-medium text-sm">
                    {store_owner.last_login_at
                      ? formatDateTime(store_owner.last_login_at)
                      : "Never"}
                  </span>
                </div>
                {/* Last Active */}
                <div className="flex justify-between items-center py-2 border-b border-[#f0f2f4] dark:border-[#324467]">
                  <span className="text-[#637588] dark:text-[#92a4c9] text-sm">
                    Last Active
                  </span>
                  <span className="text-[#111418] dark:text-white font-medium text-sm">
                    {store_owner.last_active_at
                      ? formatDateTime(store_owner.last_active_at)
                      : "N/A"}
                  </span>
                </div>
                {/* Verified */}
                <div className="flex justify-between items-center py-2 border-b border-[#f0f2f4] dark:border-[#324467]">
                  <span className="text-[#637588] dark:text-[#92a4c9] text-sm">
                    Verified
                  </span>
                  <span
                    className={`text-sm font-medium px-2 py-1 rounded 
                    ${store_owner.verification_status == VERIFICATION_STATUS.VERIFIED
                        ? "bg-green-100 text-green-600"
                        : store_owner.verification_status == VERIFICATION_STATUS.REJECTED
                          ? "bg-red-100 text-red-600"
                          : store_owner.verification_status == VERIFICATION_STATUS.PENDING
                            ? "bg-yellow-100 text-yellow-600"
                            : "bg-gray-100 text-gray-600"}    
                      `}
                  >
                    {store_owner.verification_status}
                  </span>
                </div>
              </div>
            </div>

            {/* Store Details */}
            <div className="bg-white dark:bg-[#232f48] rounded-xl p-5 border border-[#e5e7eb] dark:border-[#324467] shadow-sm">
              <h3 className="text-[#111418] dark:text-white text-lg font-bold leading-tight mb-4 flex items-center gap-2">
                <MdAccountCircle className="text-primary" />
                Store Details
              </h3>

              <div className="space-y-4">
                {/* No of stores */}
                <div className="flex justify-between items-center py-2 border-b border-[#f0f2f4] dark:border-[#324467]">
                  <span className="text-[#637588] dark:text-[#92a4c9] text-sm">
                    No of stores
                  </span>
                  <span className="text-[#111418] capitalize  dark:text-white font-medium text-sm">
                    {store_owner.store_count}
                  </span>
                </div>

                {/* No of Active stores */}
                <div className="flex justify-between items-center py-2 border-b border-[#f0f2f4] dark:border-[#324467]">
                  <span className="text-[#637588] dark:text-[#92a4c9] text-sm">
                    No of Active stores
                  </span>
                  <span className="text-[#111418] dark:text-white font-medium text-sm">
                    {store_owner.activeStoreCount}
                  </span>
                </div>
                {/* Last Active */}
                <div className="flex justify-between items-center py-2 border-b border-[#f0f2f4] dark:border-[#324467]">
                  <span className="text-[#637588] dark:text-[#92a4c9] text-sm">
                    No of InActive stores
                  </span>
                  <span className="text-[#111418] dark:text-white font-medium text-sm">
                    {store_owner.inactiveStoreCount}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EditStoreOwnerDetails
        showEditModal={showEditModal}
        store_owner={store_owner}
        onClose={() => setShowEditModal(false)}
        handleSubmit={handleSubmit}
      />

      <UpdateStatusPopup
        show={showUpdateStatusModal}
        reasonValue={store_owner.account_deactivated_reason || ""}
        currentStatus={store_owner.account_status}
        onClose={() => setShowUpdateStatusModal(false)}
        onSubmit={handleUpdateStatus}
      />
    </div>
  );
};

export default storeOwnerDetail;
