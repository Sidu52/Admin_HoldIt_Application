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
import { UserDetailSkeleton } from "@/app/loading/user";
import { EditUserDetails, AddressManagerModal } from "@/app/components/user";
import { BsFillCalendarMonthFill } from "react-icons/bs";
import Link from "next/link";
import NoData from "@/app/NoData";
import { formatDateTime } from "@/app/utils/helper";
import { User, UserUpdateData, Address } from "@/app/types/user";
import { useAddNewAddressMutation, useDeleteAddressMutation, useGetUserDetailsQuery, useUpdateAddressMutation, useUpdateUserMutation, useUpdateUserStatusMutation } from "../../../../services/userApi";
import { useToast } from "../../../../hooks/useToast";
import UpdateStatusPopup from "@/app/components/common/UpdateStatusPopupProps";
import { ACCOUNT_STATUS, ROLES } from "@/app/enum";
import { useGetProfileQuery } from "@/app/services/adminApi";
import { hasControl } from "@/app/utils/role";

const userDetails = ({ user_id }: { user_id: string }) => {
  const { data: profileData, isLoading: isLoadingProfile } = useGetProfileQuery();
  const { data, isLoading, isError } = useGetUserDetailsQuery(user_id);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const toast = useToast();

  const is_admin = profileData?.data.role === ROLES.ADMIN || profileData?.data.role === ROLES.SUPER_ADMIN

  const user = data?.data;
  const canControlUsers = hasControl(profileData?.data?.role, "users");

  const [updateUser, { isLoading: isUpdatingUser }] = useUpdateUserMutation();
  const [addNewAddress, { isLoading: isAddingNewAddress }] = useAddNewAddressMutation();
  const [updateAddress, { isLoading: isUpdatingAddress }] = useUpdateAddressMutation();
  const [deleteAddress, { isLoading: isDeletingAddress }] = useDeleteAddressMutation();

  const handleSubmit = async (formData: UserUpdateData) => {
    try {
      await updateUser({ userId: user_id, data: formData }).unwrap();
      toast.success("User updated successfully");
      setShowEditModal(false);
    } catch {
      toast.error("Failed to update user");
    }
  };

  const handleUpdateAddresses = async (newAddresses: Address[]) => {
    try {
      if (!user) return;
      const updateData: UserUpdateData = {
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone || "",
        gender: user.gender || "",
        date_of_birth: user.date_of_birth || "",
        addresses: newAddresses,
        verification_status: user.verification_status || "",
      };
      await updateUser({ userId: user_id, data: updateData }).unwrap();
      toast.success("Addresses updated successfully");
      setShowAddressModal(false);
    } catch {
      toast.error("Failed to update addresses");
    }
  };

  const [updateUserStatus] = useUpdateUserStatusMutation();
  const handleUpdateStatus = async (
    account_status: string,
    reason: string,
  ) => {
    try {
      await updateUserStatus({ userId: user_id, account_status, reason }).unwrap();
      toast.success("User status updated");
      setShowUpdateStatusModal(false);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleAddAddress = async (userId: string, address: any) => {
    await addNewAddress({ userId, address }).unwrap();
  };

  const handleUpdateAddress = async (userId: string, addressId: string, address: any) => {
    await updateAddress({ userId, addressId, address }).unwrap();
  };

  const handleDeleteAddress = async (userId: string, addressId: string) => {
    await deleteAddress({ userId, addressId }).unwrap();
  };

  if (isLoading || isLoadingProfile) return <UserDetailSkeleton />;
  if (isError || !user) return <NoData />;

  console.log(profileData)
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
            href="/users"
          >
            User Manager
          </Link>
          <span className="text-[#637588] dark:text-[#92a4c9] text-[13px] font-medium leading-normal">
            /
          </span>
          <span className="text-[#111418] dark:text-white text-[13px] font-medium leading-normal">
            {user.first_name} {user.last_name}
          </span>
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center">
            <div className="flex items-center justify-center h-14 w-14 shrink-0 bg-[#f0f2f4] dark:bg-[#324467] rounded-full font-bold">
              <p> {user.first_name[0] + user.last_name[0]}</p>
            </div>
            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-[#111418] dark:text-white text-2xl sm:text-[32px] font-bold leading-tight">
                  {user.first_name} {user.last_name}</h1>
                <span
                  className={`${user.account_status === ACCOUNT_STATUS.ACTIVE
                    ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                    : user.account_status === ACCOUNT_STATUS.INACTIVE ||
                      user.account_status === ACCOUNT_STATUS.BLOCKED
                      ? "bg-red-500/20 text-red-600 dark:text-red-400"
                      : "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400"
                    } text-xs font-bold px-2 py-1 rounded-full border border-emerald-500/20 uppercase tracking-wide`}
                >
                  {user.account_status}
                </span>
              </div>
              <p className="text-[#637588] dark:text-[#92a4c9] text-[13px] font-normal leading-normal flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">
                  <BiBadge />
                </span>
                User ID: {user._id}
              </p>
              <p className="text-[#637588] dark:text-[#92a4c9] text-[13px] font-normal leading-normal flex items-center gap-2 mt-1">
                <span className="material-symbols-outlined text-[18px]">
                  <BsFillCalendarMonthFill />
                </span>
                Joined {formatDateTime(user.createdAt)}
              </p>
            </div>
          </div>
          {canControlUsers && (
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
          )}
        </div>

        <div className="grid grid-cols-1 gap-8 px-4 flex-1 min-h-0 overflow-y-auto mt-8">
          <div className="flex flex-col gap-6">
            <div className="bg-white dark:bg-[#232f48] rounded-xl p-5 border border-[#e5e7eb] dark:border-[#324467] shadow-sm">
              <h3 className="text-[#111418] dark:text-white text-lg font-bold leading-tight mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">
                  <MdContactMail />
                </span>
                Contact Information
              </h3>

              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg text-primary">
                    <MdAccountCircle size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[#637588] dark:text-[#92a4c9] text-xs font-medium uppercase tracking-wider">
                      Full Name
                    </span>
                    <span className="text-[#111418] dark:text-white font-medium text-sm">
                      {user.first_name} {user.last_name}
                    </span>
                  </div>
                </div>
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
                        {user.email}
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
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg text-primary">
                    <MdPhoneCallback size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[#637588] dark:text-[#92a4c9] text-xs font-medium uppercase tracking-wider">
                      Phone
                    </span>
                    <span className="text-[#111418] dark:text-white font-medium text-sm">
                      {user?.phone}
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg text-primary">
                    <MdWc size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[#637588] dark:text-[#92a4c9] text-xs font-medium uppercase tracking-wider">
                      Gender
                    </span>
                    <span className="text-[#111418] dark:text-white font-medium text-sm">
                      {user.gender || "Not specified"}
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg text-primary">
                    <MdCake size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[#637588] dark:text-[#92a4c9] text-xs font-medium uppercase tracking-wider">
                      Date of Birth
                    </span>
                    <span className="text-[#111418] dark:text-white font-medium text-sm">
                      {formatDateTime(user.date_of_birth, "date")}
                    </span>
                  </div>
                </div>

              </div>
            </div>
            <div className="bg-white dark:bg-[#232f48] rounded-xl p-5 border border-[#e5e7eb] dark:border-[#324467] shadow-sm">
              <h3 className="text-[#111418] dark:text-white text-lg font-bold leading-tight mb-4 flex items-center gap-2">
                <MdAccountCircle className="text-primary" />
                Account Details
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-[#f0f2f4] dark:border-[#324467]">
                  <span className="text-[#637588] dark:text-[#92a4c9] text-sm">
                    Last Login
                  </span>
                  <span className="text-[#111418] dark:text-white font-medium text-sm">
                    {user.last_login_at
                      ? formatDateTime(user.last_login_at)
                      : "Never"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[#f0f2f4] dark:border-[#324467]">
                  <span className="text-[#637588] dark:text-[#92a4c9] text-sm">
                    Last Active
                  </span>
                  <span className="text-[#111418] dark:text-white font-medium text-sm">
                    {user.last_active_at
                      ? formatDateTime(user.last_active_at)
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[#f0f2f4] dark:border-[#324467]">
                  <span className="text-[#637588] dark:text-[#92a4c9] text-sm">
                    Verified
                  </span>
                  <span
                    className={`text-sm font-medium px-2 py-1 rounded ${user.is_verified
                      ? "bg-green-100 text-green-600"
                      : "bg-yellow-100 text-yellow-600"
                      }`}
                  >
                    {user.is_verified ? "Verified" : "Not Verified"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-[#f0f2f4] dark:border-[#324467]">
                  <span className="text-[#637588] dark:text-[#92a4c9] text-sm">
                    Serviceable
                  </span>
                  <span
                    className={`text-sm font-medium px-2 py-1 rounded ${user.is_serviceable
                      ? "bg-blue-100 text-blue-600"
                      : "bg-gray-100 text-gray-600"
                      }`}
                  >
                    {user.is_serviceable ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-[#232f48] rounded-xl p-5 border border-[#e5e7eb] dark:border-[#324467] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-[#111418] dark:text-white text-lg font-bold leading-tight flex items-center gap-2">
                    <span className="mt-1 bg-blue-50 dark:bg-blue-900/20 p-1.5 rounded-lg text-primary">
                      <MdLocationOn size={18} />
                    </span>
                    Addresses
                  </h3>
                  <span className="text-xs font-semibold ml-2 px-2 py-1 bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 rounded-full">
                    {user.addresses?.length || 0} Saved
                  </span>
                </div>
                {canControlUsers && (
                  <button
                    onClick={() => setShowAddressModal(true)}
                    className="text-sm font-semibold text-primary hover:text-blue-700 dark:hover:text-blue-400 transition-colors flex items-center gap-1"
                  >
                    <BiEdit size={16} /> Manage
                  </button>
                )}
              </div>

              {user.addresses && user.addresses.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {user.addresses.map((addr: Address, idx: number) => (
                    <div
                      key={addr._id || idx}
                      className={`flex flex-col p-4 rounded-xl border ${addr.is_default
                        ? "border-primary bg-blue-50/30 dark:bg-blue-900/10"
                        : "border-[#e5e7eb] dark:border-[#324467]"
                        }`}
                    >
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#111418] dark:text-white">
                            {addr.is_default ? "Default Address" : `Address ${idx + 1}`}
                          </span>
                          {addr.is_default && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                              Default
                            </span>
                          )}
                        </div>
                        {addr.is_serviceable !== undefined && (
                          addr.is_serviceable ? (
                            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">
                              <BiCheckCircle size={12} /> Serviceable
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[11px] font-semibold text-red-500 bg-red-50 dark:bg-red-500/10 px-2 py-0.5 rounded-full">
                              <BiBlock size={12} /> Unserviceable
                            </span>
                          )
                        )}
                      </div>
                      <p className="text-sm text-[#637588] dark:text-[#92a4c9] leading-relaxed">
                        {addr.street}, {addr.city}, {addr.state} - {addr.postal_code}
                      </p>
                      <p className="text-sm text-[#637588] dark:text-[#92a4c9] leading-relaxed">
                        {addr.country}
                      </p>
                      {addr.coordinates && addr.coordinates.length === 2 && (
                        <p className="text-xs text-[#a0aab5] mt-2 font-mono flex gap-2">
                          <span>Lat: {addr.coordinates[1]?.toFixed(4)}</span>
                          <span>Lng: {addr.coordinates[0]?.toFixed(4)}</span>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center border border-dashed border-[#e5e7eb] dark:border-[#324467] rounded-xl bg-[#f8f9fc] dark:bg-[#1a2332]/50">
                  <div className="mx-auto w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
                    <MdLocationOn className="text-slate-400" size={20} />
                  </div>
                  <p className="text-sm text-[#637588] dark:text-[#92a4c9]">
                    No addresses saved yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <EditUserDetails
        showEditModal={showEditModal}
        user={user}
        onClose={() => setShowEditModal(false)}
        handleSubmit={handleSubmit}
      />

      <UpdateStatusPopup
        show={showUpdateStatusModal}
        reasonValue={user.reason}
        currentStatus={user.account_status}
        onClose={() => setShowUpdateStatusModal(false)}
        onSubmit={handleUpdateStatus}
      />

      {user && (
        <AddressManagerModal
          user={user}
          showModal={showAddressModal}
          onClose={() => setShowAddressModal(false)}
          onAddAddress={handleAddAddress}
          onUpdateAddress={handleUpdateAddress}
          onDeleteAddress={handleDeleteAddress}
          isLoading={isUpdatingUser}
          isAdmin={is_admin}
        />
      )}
    </div>
  );
};

export default userDetails;
