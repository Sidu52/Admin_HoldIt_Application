"use client";

import { useState } from "react";
import {
  BiBadge,
  BiBlock,
  BiCheckCircle,
  BiEdit,
  BiHome,
  BiCopy,
  BiCheck,
} from "react-icons/bi";
import {
  MdAccountCircle,
  MdCake,
  MdContactMail,
  MdLocationOn,
  MdMail,
  MdPhoneCallback,
  MdWc,
  MdAdminPanelSettings,
  MdSecurity,
  MdWarning,
} from "react-icons/md";
import { BsFillCalendarMonthFill } from "react-icons/bs";
import Link from "next/link";
import NoData from "@/app/NoData";
import { formatDateTime } from "@/app/utils/helper";
import { User, UserUpdateData, Address } from "@/app/types/user";
import {
  useAddNewAddressMutation,
  useDeleteAddressMutation,
  useGetUserDetailsQuery,
  useUpdateAddressMutation,
  useUpdateUserMutation,
} from "../../../../services/userApi";
import {
  useGetUserCouponsQuery,
  useGetCoupansQuery,
  useAssignCouponMutation,
  useUnassignCouponMutation,
} from "../../../../services/coupan.Api";
import { RiCoupon3Line } from "react-icons/ri";
import { useToast } from "../../../../hooks/useToast";
import { StatusBadge } from "../../../../components/common/StatusBadge";
import { UserDetailSkeleton } from "@/app/loading/user";
import { EditUserDetails, AddressManagerModal } from "@/app/components/user";
import { ACCOUNT_STATUS, ROLES, VERIFICATION_STATUS } from "@/app/enum";
import { useGetProfileQuery } from "@/app/services/adminApi";
import { hasControl } from "@/app/utils/role";

const UserDetails = ({ user_id }: { user_id: string }) => {
  const toast = useToast();
  const { data: profileData, isLoading: isLoadingProfile } = useGetProfileQuery();
  const { data, isLoading, isError } = useGetUserDetailsQuery(user_id);

  const [activeTab, setActiveTab] = useState<"profile" | "addresses" | "security" | "coupons">("profile");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editModalTab, setEditModalTab] = useState<"personal" | "addresses" | "account">("personal");
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Assigned Coupons State & Queries
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedCouponToAssign, setSelectedCouponToAssign] = useState<string>("");

  const { data: userCouponsData, isLoading: isLoadingCoupons, refetch: refetchUserCoupons } = useGetUserCouponsQuery(user_id);
  const [assignCoupon, { isLoading: isAssigning }] = useAssignCouponMutation();
  const [unassignCoupon, { isLoading: isUnassigning }] = useUnassignCouponMutation();
  const { data: allCouponsData } = useGetCoupansQuery({ page: 1, limit: 100, isActive: true }, { skip: !showAssignModal });

  const user: User = data?.data;
  const assignedCoupons = userCouponsData?.data?.assignedCoupons || [];
  const totalAssignedCount = userCouponsData?.data?.totalAssignedCount ?? (user?.totalAssignedCouponsCount || assignedCoupons.length);
  const activeAssignedCount = userCouponsData?.data?.activeAssignedCount ?? (user?.assignedCouponsCount || assignedCoupons.filter((c: any) => c.status === "ACTIVE").length);

  const is_admin =
    profileData?.data?.role === ROLES.ADMIN ||
    profileData?.data?.role === ROLES.SUPER_ADMIN;
  const canControlUsers = hasControl(profileData?.data?.role, "users");

  const [updateUser, { isLoading: isUpdatingUser }] = useUpdateUserMutation();
  const [addNewAddress] = useAddNewAddressMutation();
  const [updateAddress] = useUpdateAddressMutation();
  const [deleteAddress] = useDeleteAddressMutation();

  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleOpenEditModal = (tab: "personal" | "addresses" | "account") => {
    setEditModalTab(tab);
    setShowEditModal(true);
  };

  const handleSubmit = async (formData: UserUpdateData) => {
    try {
      await updateUser({ userId: user_id, data: formData }).unwrap();
      toast.success("User updated successfully");
      setShowEditModal(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update user");
    }
  };

  const handleAddAddress = async (userId: string, address: any) => {
    try {
      await addNewAddress({ userId, address }).unwrap();
      toast.success("Address added successfully");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to add address");
    }
  };

  const handleUpdateAddress = async (userId: string, addressId: string, address: any) => {
    try {
      await updateAddress({ userId, addressId, address }).unwrap();
      toast.success("Address updated successfully");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update address");
    }
  };

  const handleDeleteAddress = async (userId: string, addressId: string) => {
    try {
      await deleteAddress({ userId, addressId }).unwrap();
      toast.success("Address deleted successfully");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete address");
    }
  };

  if (isLoading || isLoadingProfile) return <UserDetailSkeleton />;
  if (isError || !user) return <NoData />;

  const savedAddresses = user.addresses || [];
  const defaultAddress = savedAddresses.find((a) => a.is_default);
  const serviceableAddressesCount = savedAddresses.filter((a) => a.is_serviceable).length;

  return (
    <div className="flex h-screen flex-col bg-background text-foreground relative overflow-hidden">
      <div className="flex flex-col max-w-[1240px] w-full mx-auto flex-1 min-h-0 px-4 sm:px-6 py-5 overflow-y-auto">
        {/* Breadcrumb */}
        <div className="flex gap-2 px-2 py-1 mb-3 shrink-0">
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

        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white dark:bg-[#232f48] p-5 rounded-2xl border border-slate-200 dark:border-[#324467] shadow-xs shrink-0">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 items-start sm:items-center">
            <div className="flex items-center justify-center h-16 w-16 shrink-0 bg-blue-50 dark:bg-[#1a2333] text-primary border border-blue-100 dark:border-[#324467] rounded-2xl font-bold text-xl shadow-xs">
              <p>
                {user?.first_name?.[0]?.toUpperCase() || ""}
                {user?.last_name?.[0]?.toUpperCase() || "U"}
              </p>
            </div>
            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-[#111418] dark:text-white text-2xl sm:text-3xl font-bold leading-tight">
                  {user.first_name} {user.last_name}
                </h1>
                <StatusBadge account_status={user.account_status} />
                {user?.verification_status && (
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                      user.verification_status === VERIFICATION_STATUS.VERIFIED
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                        : user.verification_status === VERIFICATION_STATUS.REJECTED
                        ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
                        : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                    }`}
                  >
                    {user.verification_status}
                  </span>
                )}
                <span
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                    user?.is_serviceable
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800"
                      : "bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      user?.is_serviceable ? "bg-emerald-500" : "bg-slate-400"
                    }`}
                  />
                  {user?.is_serviceable ? "Serviceable" : "Unserviceable"}
                </span>

                {/* Assigned Coupons Badge */}
                <button
                  onClick={() => setActiveTab("coupons")}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors cursor-pointer"
                >
                  <RiCoupon3Line size={13} />
                  <span>{activeAssignedCount} Coupons Assigned</span>
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-[#637588] dark:text-[#92a4c9] text-[13px] mt-1">
                <p className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[17px]">
                    <BiBadge />
                  </span>
                  <span>User ID: <code className="font-mono">{user?._id}</code></span>
                  <button
                    onClick={() => handleCopy(user?._id, "userId")}
                    className="p-1 hover:text-primary transition-colors cursor-pointer"
                    title="Copy User ID"
                  >
                    {copiedKey === "userId" ? <BiCheck className="text-emerald-500" size={14} /> : <BiCopy size={14} />}
                  </button>
                </p>
                <p className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[17px]">
                    <BsFillCalendarMonthFill />
                  </span>
                  <span>Joined {formatDateTime(user?.createdAt)}</span>
                </p>
              </div>
            </div>
          </div>

          {canControlUsers && (
            <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto">
              <button
                onClick={() => handleOpenEditModal("personal")}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 cursor-pointer rounded-xl h-10 px-4 bg-primary hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <BiEdit size={16} />
                <span>Edit User</span>
              </button>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 border-b border-slate-200 dark:border-[#324467] mt-6 shrink-0">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "profile"
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <MdAccountCircle size={16} />
            <span>Profile & Contact</span>
          </button>
          <button
            onClick={() => setActiveTab("addresses")}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "addresses"
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <MdLocationOn size={16} />
            <span>Addresses & Locations</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
              {savedAddresses.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "security"
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <MdSecurity size={16} />
            <span>Account Security & Operations</span>
          </button>
          <button
            onClick={() => setActiveTab("coupons")}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "coupons"
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <RiCoupon3Line size={16} />
            <span>Assigned Coupons</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
              {activeAssignedCount}
            </span>
          </button>
        </div>

        {/* TAB 1: PROFILE & CONTACT */}
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 pb-8">
            {/* Contact Information Card */}
            <div className="bg-white dark:bg-[#232f48] rounded-2xl p-6 border border-slate-200 dark:border-[#324467] shadow-xs">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <MdContactMail className="text-primary" size={20} />
                  Contact Information
                </h3>
                {canControlUsers && (
                  <button
                    onClick={() => handleOpenEditModal("personal")}
                    className="text-xs font-bold text-primary hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <BiEdit size={14} /> Edit
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#1c2438] border border-slate-100 dark:border-[#2a3852]">
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-primary">
                    <MdAccountCircle size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Full Name
                    </p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {user.first_name} {user.last_name}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#1c2438] border border-slate-100 dark:border-[#2a3852]">
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-primary">
                    <MdMail size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Email Address
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                        {user.email || "No email registered"}
                      </p>
                      {user.email && (
                        <button
                          onClick={() => handleCopy(user.email, "email")}
                          className="p-1 text-slate-400 hover:text-primary transition-colors cursor-pointer"
                          title="Copy Email"
                        >
                          {copiedKey === "email" ? <BiCheck className="text-emerald-500" size={14} /> : <BiCopy size={14} />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#1c2438] border border-slate-100 dark:border-[#2a3852]">
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-primary">
                    <MdPhoneCallback size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Phone Number
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                        {user.phone || "No phone registered"}
                      </p>
                      {user.phone && (
                        <button
                          onClick={() => handleCopy(user.phone, "phone")}
                          className="p-1 text-slate-400 hover:text-primary transition-colors cursor-pointer"
                          title="Copy Phone"
                        >
                          {copiedKey === "phone" ? <BiCheck className="text-emerald-500" size={14} /> : <BiCopy size={14} />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#1c2438] border border-slate-100 dark:border-[#2a3852]">
                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-primary">
                      <MdWc size={18} />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Gender
                      </p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white capitalize">
                        {user.gender ? user.gender.replace(/_/g, " ") : "Not specified"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#1c2438] border border-slate-100 dark:border-[#2a3852]">
                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-primary">
                      <MdCake size={18} />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Date of Birth
                      </p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {user.date_of_birth ? formatDateTime(user.date_of_birth, "date") : "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Activity Card */}
            <div className="bg-white dark:bg-[#232f48] rounded-2xl p-6 border border-slate-200 dark:border-[#324467] shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <MdAdminPanelSettings className="text-primary" size={20} />
                    Account Activity & Status
                  </h3>
                  <StatusBadge account_status={user.account_status} />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-[#1c2438]">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Last Login</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-white">
                      {user.last_login_at ? formatDateTime(user.last_login_at) : "Never logged in"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-[#1c2438]">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Last Active</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-white">
                      {user.last_active_at ? formatDateTime(user.last_active_at) : "N/A"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-[#1c2438]">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Profile Complete</span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <BiCheckCircle size={14} /> Completed
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-[#1c2438]">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Luggage Serviceability</span>
                    <span className={`text-xs font-bold ${user.is_serviceable ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500"}`}>
                      {user.is_serviceable ? "Eligible for Bookings" : "Restricted Area"}
                    </span>
                  </div>

                  {user.account_deactivated_reason && (
                    <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 mt-3">
                      <p className="text-[11px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider mb-1">
                        Deactivation / Suspension Note
                      </p>
                      <p className="text-xs text-rose-800 dark:text-rose-300">
                        {user.account_deactivated_reason}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {canControlUsers && (
                <div className="pt-5 mt-5 border-t border-slate-100 dark:border-[#2a3852] flex justify-end">
                  <button
                    onClick={() => handleOpenEditModal("account")}
                    className="text-xs font-bold px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white transition-colors cursor-pointer"
                  >
                    Manage Account Operations & Status
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ADDRESSES & LOCATIONS */}
        {activeTab === "addresses" && (
          <div className="space-y-6 mt-6 pb-8">
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-[#232f48] border border-slate-200 dark:border-[#324467] shadow-xs">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                  Total Saved Addresses
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {savedAddresses.length}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-[#232f48] border border-slate-200 dark:border-[#324467] shadow-xs">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                  Default Address
                </p>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-2 truncate">
                  {defaultAddress ? `${defaultAddress.city}, ${defaultAddress.state}` : "None set"}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-[#232f48] border border-slate-200 dark:border-[#324467] shadow-xs">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                  Serviceable Addresses
                </p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  {serviceableAddressesCount} / {savedAddresses.length}
                </p>
              </div>
            </div>

            {/* Addresses Card */}
            <div className="bg-white dark:bg-[#232f48] rounded-2xl p-6 border border-slate-200 dark:border-[#324467] shadow-xs">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <MdLocationOn className="text-primary" size={20} />
                  Saved Addresses
                </h3>
                {canControlUsers && (
                  <button
                    onClick={() => setShowAddressModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    <BiEdit size={14} /> Manage Addresses
                  </button>
                )}
              </div>

              {savedAddresses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savedAddresses.map((addr: Address, idx: number) => (
                    <div
                      key={addr._id || idx}
                      className={`p-4 rounded-2xl border transition-all ${
                        addr.is_default
                          ? "border-primary/50 bg-blue-50/30 dark:bg-blue-900/10"
                          : "border-slate-200 dark:border-[#324467] bg-slate-50/50 dark:bg-[#1c2438]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4 mb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">
                            {addr.is_default ? "Default Address" : `Address ${idx + 1}`}
                          </span>
                          {addr.is_default && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                              Default
                            </span>
                          )}
                          {addr.type && (
                            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                              {addr.type}
                            </span>
                          )}
                        </div>
                        {addr.is_serviceable !== undefined && (
                          <span
                            className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                              addr.is_serviceable
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                                : "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
                            }`}
                          >
                            {addr.is_serviceable ? (
                              <>
                                <BiCheckCircle size={12} /> Serviceable
                              </>
                            ) : (
                              <>
                                <BiBlock size={12} /> Unserviceable
                              </>
                            )}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                        {addr.street}, {addr.city}, {addr.state} - {addr.postal_code}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {addr.country}
                      </p>

                      {addr.coordinates && addr.coordinates.length === 2 && (
                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-[#2a3852]">
                          <span>Lng: {addr.coordinates[0]?.toFixed(4)}</span>
                          <span>Lat: {addr.coordinates[1]?.toFixed(4)}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center border border-dashed border-slate-200 dark:border-[#324467] rounded-2xl bg-slate-50/50 dark:bg-[#1a2332]/50">
                  <div className="mx-auto w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
                    <MdLocationOn className="text-slate-400" size={24} />
                  </div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    No addresses registered yet
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Addresses saved by the user during booking will show up here.
                  </p>
                  {canControlUsers && (
                    <button
                      onClick={() => setShowAddressModal(true)}
                      className="mt-4 px-4 py-2 rounded-xl bg-primary hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                    >
                      Add Address
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: ACCOUNT SECURITY & OPERATIONS */}
        {activeTab === "security" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 pb-8">
            {/* Status & Operations Card */}
            <div className="bg-white dark:bg-[#232f48] rounded-2xl p-6 border border-slate-200 dark:border-[#324467] shadow-xs">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <MdAdminPanelSettings className="text-primary" size={20} />
                  Account Status & Restrictions
                </h3>
                <StatusBadge account_status={user.account_status} />
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1c2438] border border-slate-100 dark:border-[#2a3852]">
                  <p className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                    Status Governance
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Deactivating or blocking an account immediately revokes all existing refresh tokens and blocks future luggage bookings. An account cannot be deactivated while active bookings are in transit or stored.
                  </p>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-[#324467]">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Account Status
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Current platform access level
                    </p>
                  </div>
                  <StatusBadge account_status={user.account_status} />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-[#324467]">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Verification Status
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      User KYC & onboarding verification
                    </p>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-primary font-mono">
                    {user.verification_status || "PENDING"}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-[#324467]">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Serviceable Eligibility
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Permission to create luggage bookings
                    </p>
                  </div>
                  <span
                    className={`text-xs font-bold ${
                      user.is_serviceable ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500"
                    }`}
                  >
                    {user.is_serviceable ? "Active" : "Restricted"}
                  </span>
                </div>

                {user.account_deactivated_reason && (
                  <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50">
                    <p className="text-[11px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider mb-1">
                      Reason for Deactivation / Suspension
                    </p>
                    <p className="text-xs text-rose-800 dark:text-rose-300">
                      {user.account_deactivated_reason}
                    </p>
                  </div>
                )}
              </div>

              {canControlUsers && (
                <div className="pt-5 mt-5 border-t border-slate-100 dark:border-[#2a3852] flex justify-end">
                  <button
                    onClick={() => handleOpenEditModal("account")}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    <BiEdit size={16} /> Edit Account Status & Reason
                  </button>
                </div>
              )}
            </div>

            {/* Active Booking Conflict Notice Card */}
            <div className="bg-white dark:bg-[#232f48] rounded-2xl p-6 border border-slate-200 dark:border-[#324467] shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                  <MdSecurity className="text-primary" size={20} />
                  Booking Safety & Anti-Fraud
                </h3>

                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-800 dark:text-amber-300">
                    <MdWarning className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" size={18} />
                    <div className="space-y-1">
                      <p className="font-bold">Active Booking Safeguard</p>
                      <p className="leading-relaxed">
                        If this user has any active luggage bookings (e.g., luggage stored in warehouse, driver assigned, or in transit), the backend system strictly forbids deactivation until bookings are completed or officially settled.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1c2438] border border-slate-100 dark:border-[#2a3852] space-y-2">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Token Revocation on Status Change
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Changing status to <code className="font-mono text-rose-500">BLOCKED</code> or <code className="font-mono text-rose-500">INACTIVE</code> automatically purges the user's active session keys in Redis cache, requiring fresh authentication if reinstated.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-5 mt-5 border-t border-slate-100 dark:border-[#2a3852]">
                <p className="text-[11px] text-slate-400">
                  Last updated: {formatDateTime(user.updatedAt || user.createdAt)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ASSIGNED COUPONS */}
        {activeTab === "coupons" && (
          <div className="mt-6 pb-8 space-y-6 animate-in fade-in duration-200">
            {/* Summary Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-[#232f48] p-5 rounded-2xl border border-slate-200 dark:border-[#324467] shadow-xs">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Assigned Coupons</p>
                <div className="flex items-baseline justify-between mt-1">
                  <p className="text-2xl font-black text-purple-600 dark:text-purple-400">
                    {activeAssignedCount}
                  </p>
                  <span className="text-xs text-slate-400 font-medium">Ready to redeem</span>
                </div>
              </div>

              <div className="bg-white dark:bg-[#232f48] p-5 rounded-2xl border border-slate-200 dark:border-[#324467] shadow-xs">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Coupons Granted</p>
                <div className="flex items-baseline justify-between mt-1">
                  <p className="text-2xl font-black text-slate-900 dark:text-white">
                    {totalAssignedCount}
                  </p>
                  <span className="text-xs text-slate-400 font-medium">Lifetime assignments</span>
                </div>
              </div>

              <div className="bg-white dark:bg-[#232f48] p-5 rounded-2xl border border-slate-200 dark:border-[#324467] shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Grant User Offer</p>
                  <p className="text-xs text-slate-500 mt-1">Assign an exclusive coupon</p>
                </div>
                {canControlUsers && (
                  <button
                    onClick={() => {
                      setSelectedCouponToAssign("");
                      setShowAssignModal(true);
                    }}
                    className="px-3.5 py-2 bg-primary hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <RiCoupon3Line size={14} /> Assign Coupon
                  </button>
                )}
              </div>
            </div>

            {/* Coupons List / Table */}
            <div className="bg-white dark:bg-[#232f48] rounded-2xl border border-slate-200 dark:border-[#324467] shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-[#324467] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RiCoupon3Line className="text-primary text-base" />
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Coupons Assigned to Customer ({assignedCoupons.length})
                  </h3>
                </div>
                {canControlUsers && (
                  <button
                    onClick={() => {
                      setSelectedCouponToAssign("");
                      setShowAssignModal(true);
                    }}
                    className="text-primary hover:underline text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    + Assign New Coupon
                  </button>
                )}
              </div>

              {isLoadingCoupons ? (
                <div className="p-8 text-center text-xs text-slate-400">Loading assigned coupons...</div>
              ) : assignedCoupons.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xl">
                    <RiCoupon3Line />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">No Coupons Assigned</h4>
                    <p className="text-xs text-slate-500 max-w-sm mt-0.5">
                      This user has not been granted any exclusive coupons yet.
                    </p>
                  </div>
                  {canControlUsers && (
                    <button
                      onClick={() => {
                        setSelectedCouponToAssign("");
                        setShowAssignModal(true);
                      }}
                      className="px-4 py-2 bg-primary hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer mt-2"
                    >
                      <RiCoupon3Line size={14} /> Assign First Coupon
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-[#324467] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                        <th className="py-3 px-6">Coupon Code & Details</th>
                        <th className="py-3 px-4">Discount</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Usage Count</th>
                        <th className="py-3 px-4">Assigned On</th>
                        <th className="py-3 px-4">Valid Until</th>
                        <th className="py-3 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-[#324467]/50">
                      {assignedCoupons.map((item: any) => {
                        const cp = item.coupon || item.couponId;
                        if (!cp) return null;
                        const isRevoked = item.status === "REVOKED";
                        const expiry = cp.expiresAt || cp.validTill;
                        const isExpired = expiry && new Date(expiry) < new Date();

                        return (
                          <tr key={item.assignmentId || item._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                            <td className="py-3.5 px-6">
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <Link
                                    href={`/coupans/${cp._id}`}
                                    className="font-mono font-black text-slate-900 dark:text-white hover:text-primary transition-colors text-sm"
                                  >
                                    {cp.code}
                                  </Link>
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                                    {cp.scope || "ASSIGNED"}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500 max-w-xs truncate">{cp.name || cp.description}</p>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                              {cp.discountType === "PERCENTAGE" ? `${cp.discountValue}% OFF` : `₹${cp.discountValue} OFF`}
                              {cp.minOrderValue > 0 && (
                                <span className="block text-[10px] text-slate-400 font-normal">Min ₹{cp.minOrderValue}</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                  isRevoked
                                    ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800"
                                    : isExpired
                                    ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800"
                                    : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800"
                                }`}
                              >
                                {item.status || "ACTIVE"}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                              <span className="font-semibold">{item.usageCount || 0}</span>
                              <span className="text-slate-400 text-[10px]"> / {cp.perUserLimit || 1} uses</span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                              {formatDateTime(item.assignedAt)}
                            </td>
                            <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                              {expiry ? new Date(expiry).toLocaleDateString() : "No expiry"}
                            </td>
                            <td className="py-3.5 px-6 text-right">
                              {canControlUsers && (
                                item.status === "ACTIVE" ? (
                                  <button
                                    onClick={async () => {
                                      try {
                                        await unassignCoupon({ couponId: cp._id, userIds: [user_id] }).unwrap();
                                        toast.success(`Coupon ${cp.code} revoked from user`);
                                        refetchUserCoupons();
                                      } catch (err: any) {
                                        toast.error(err?.data?.message || "Failed to revoke coupon");
                                      }
                                    }}
                                    disabled={isUnassigning}
                                    className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                                  >
                                    Revoke
                                  </button>
                                ) : (
                                  <button
                                    onClick={async () => {
                                      try {
                                        await assignCoupon({ couponId: cp._id, userIds: [user_id] }).unwrap();
                                        toast.success(`Coupon ${cp.code} re-assigned to user`);
                                        refetchUserCoupons();
                                      } catch (err: any) {
                                        toast.error(err?.data?.message || "Failed to assign coupon");
                                      }
                                    }}
                                    disabled={isAssigning}
                                    className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                                  >
                                    Re-assign
                                  </button>
                                )
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── ASSIGN COUPON MODAL ── */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1a2332] w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <RiCoupon3Line className="text-primary" /> Assign Coupon to {user?.first_name} {user?.last_name}
                </h3>
                <p className="text-xs text-slate-500">Select an active coupon to assign to this customer</p>
              </div>
              <button
                onClick={() => setShowAssignModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {(allCouponsData?.data?.coupons || allCouponsData?.data || []).map((c: any) => {
                const isSelected = selectedCouponToAssign === c._id;
                const alreadyAssigned = assignedCoupons.some((a: any) => a.coupon?._id === c._id && a.status === "ACTIVE");

                return (
                  <div
                    key={c._id}
                    onClick={() => {
                      if (!alreadyAssigned) setSelectedCouponToAssign(c._id);
                    }}
                    className={`p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${
                      alreadyAssigned
                        ? "opacity-50 cursor-not-allowed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900"
                        : isSelected
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20 cursor-pointer"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 cursor-pointer"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 dark:text-white">{c.code}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary">
                          {c.discountType === "PERCENTAGE" ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                        </span>
                        {alreadyAssigned && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">
                            Already Assigned
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{c.name || c.description}</p>
                    </div>

                    {!alreadyAssigned && (
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ml-3 ${
                        isSelected ? "border-primary bg-primary text-white" : "border-slate-300 dark:border-slate-600"
                      }`}>
                        {isSelected && <BiCheck size={12} />}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!selectedCouponToAssign) return;
                  try {
                    await assignCoupon({ couponId: selectedCouponToAssign, userIds: [user_id] }).unwrap();
                    toast.success("Coupon assigned to user successfully!");
                    setShowAssignModal(false);
                    refetchUserCoupons();
                  } catch (err: any) {
                    toast.error(err?.data?.message || "Failed to assign coupon");
                  }
                }}
                disabled={!selectedCouponToAssign || isAssigning}
                className="px-5 py-2 bg-primary hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                {isAssigning ? "Assigning..." : "Confirm Assignment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Multi-Tab Drawer */}
      <EditUserDetails
        showEditModal={showEditModal}
        user={user}
        initialTab={editModalTab}
        isSubmitting={isUpdatingUser}
        onClose={() => setShowEditModal(false)}
        handleSubmit={handleSubmit}
        onOpenAddressManager={() => setShowAddressModal(true)}
      />

      {/* Address Manager Modal */}
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

export default UserDetails;
