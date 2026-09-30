"use client";

import { useState } from "react";
import {
  BiBadge,
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
  MdAccountBalance,
  MdAdminPanelSettings,
  MdStore,
  MdVerifiedUser,
  MdElectricBolt,
  MdAccountBalanceWallet,
  MdHistory,
  MdOutlineAccessTime,
  MdInfoOutline,
} from "react-icons/md";
import { BsFillCalendarMonthFill } from "react-icons/bs";
import { FaUser, FaStore, FaEye, FaEyeSlash } from "react-icons/fa";
import Link from "next/link";
import NoData from "@/app/NoData";
import { formatDateTime } from "@/app/utils/helper";
import {
  useGetStoreOwnerQuery,
  useUpdateStoreOwnerMutation,
} from "../../../../services/storeOwnerApi";
import {
  useGetPartnerSettlementSummaryQuery,
  useTriggerManualSettlementMutation,
  useVerifyPartnerBankDetailsMutation,
} from "@/app/services/settlementApi";
import { useToast } from "../../../../hooks/useToast";
import { StatusBadge } from "../../../../components/common/StatusBadge";
import { StoreOwner, StoreOwnerUpdateData } from "@/app/types/storeOwner";
import { StoreOwnerProfileDetailSkeleton } from "@/app/loading/storeOwner";
import { EditStoreOwnerDetails } from "@/app/components/store_owner";
import { VERIFICATION_STATUS } from "@/app/enum";

const StoreOwnerDetail = ({ store_owner_id }: { store_owner_id: string }) => {
  const toast = useToast();
  const { data, isLoading, isError } = useGetStoreOwnerQuery(store_owner_id);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editModalTab, setEditModalTab] = useState<"personal" | "bank" | "account">("personal");
  const [activeTab, setActiveTab] = useState<"profile" | "bank" | "stores">("profile");

  // Bank details mask & copy states
  const [showAccountMask, setShowAccountMask] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Settlement hooks and state
  const {
    data: settlementData,
    isLoading: isLoadingSettlement,
    refetch: refetchSettlement,
  } = useGetPartnerSettlementSummaryQuery(
    { recipientType: "STORE_OWNER", recipientId: store_owner_id },
    { skip: !store_owner_id }
  );
  const [triggerManualSettlement, { isLoading: isSettling }] = useTriggerManualSettlementMutation();
  const [verifyPartnerBank, { isLoading: isVerifyingBank }] = useVerifyPartnerBankDetailsMutation();

  const [isSettlementModalOpen, setIsSettlementModalOpen] = useState(false);
  const [settlementNote, setSettlementNote] = useState("");

  const settlementSummary = settlementData?.data;

  const store_owner: StoreOwner = data?.data;

  const [updateStoreOwner, { isLoading: isUpdating }] = useUpdateStoreOwnerMutation();

  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleOpenEditModal = (tab: "personal" | "bank" | "account") => {
    setEditModalTab(tab);
    setShowEditModal(true);
  };

  const handleSubmit = async (formData: StoreOwnerUpdateData) => {
    try {
      await updateStoreOwner({ ownerId: store_owner_id, data: formData }).unwrap();
      toast.success("Store owner details updated successfully");
      setShowEditModal(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update store owner");
    }
  };

  const handleVerifyBank = async () => {
    try {
      await verifyPartnerBank({ recipientType: "STORE_OWNER", recipientId: store_owner_id }).unwrap();
      toast.success("Store owner bank details verified successfully");
      refetchSettlement();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to verify bank details");
    }
  };

  const handleManualSettlementSubmit = async () => {
    try {
      const res = await triggerManualSettlement({
        recipientType: "STORE_OWNER",
        recipientId: store_owner_id,
        note: settlementNote.trim() || undefined,
      }).unwrap();
      toast.success(res?.message || "Manual settlement disbursed successfully!");
      setIsSettlementModalOpen(false);
      setSettlementNote("");
      refetchSettlement();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to execute manual settlement");
    }
  };


  if (isLoading) return <StoreOwnerProfileDetailSkeleton />;
  if (isError || !store_owner) return <NoData />;

  const bank = store_owner.bankDetails;
  const stores = store_owner.stores || [];

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

        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white dark:bg-[#232f48] p-5 rounded-2xl border border-slate-200 dark:border-[#324467] shadow-xs shrink-0">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 items-start sm:items-center">
            <div className="flex items-center justify-center h-16 w-16 shrink-0 bg-blue-50 dark:bg-[#1a2333] text-primary border border-blue-100 dark:border-[#324467] rounded-2xl font-bold text-xl shadow-xs">
              <p>{`${store_owner?.first_name?.[0] || ""}${store_owner?.last_name?.[0] || ""}`.toUpperCase() || "SO"}</p>
            </div>
            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-[#111418] dark:text-white text-2xl sm:text-3xl font-bold leading-tight">
                  {store_owner?.first_name || ""} {store_owner?.last_name || ""}
                </h1>
                <StatusBadge account_status={store_owner?.account_status} />
                {store_owner?.verification_status && (
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                      store_owner.verification_status === VERIFICATION_STATUS.VERIFIED
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                        : store_owner.verification_status === VERIFICATION_STATUS.REJECTED
                        ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
                        : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                    }`}
                  >
                    {store_owner.verification_status.replace("_", " ")}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-[#637588] dark:text-[#92a4c9] text-[13px] mt-1">
                <p className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[17px]">
                    <BiBadge />
                  </span>
                  <span>ID: <code className="font-mono">{store_owner?._id}</code></span>
                </p>
                <p className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[17px]">
                    <BsFillCalendarMonthFill />
                  </span>
                  <span>Joined {formatDateTime(store_owner?.createdAt)}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto">
            <button
              onClick={() => handleOpenEditModal("personal")}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 cursor-pointer rounded-xl h-10 px-4 bg-primary hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <BiEdit size={16} />
              <span>Edit Details</span>
            </button>
          </div>
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
            <FaUser size={14} />
            <span>Profile & Account</span>
          </button>
          <button
            onClick={() => setActiveTab("bank")}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "bank"
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <MdAccountBalance size={16} />
            <span>Bank & Settlements</span>
            {settlementSummary?.pendingSettlement && settlementSummary.pendingSettlement.netAmount > 0 ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                ₹{settlementSummary.pendingSettlement.netAmount}
              </span>
            ) : bank?.accountNumber ? (
              <span className="ml-1 w-2 h-2 rounded-full bg-emerald-500 inline-block" title="Bank details configured" />
            ) : (
              <span className="ml-1 w-2 h-2 rounded-full bg-amber-500 inline-block" title="Bank details missing" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("stores")}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "stores"
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <FaStore size={14} />
            <span>Stores Managed ({store_owner.store_count ?? stores.length})</span>
          </button>
        </div>

        {/* Tab 1: Profile & Account Operations */}
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 pb-8">
            {/* Contact Information Card */}
            <div className="bg-white dark:bg-[#232f48] rounded-2xl p-6 border border-slate-200 dark:border-[#324467] shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100 dark:border-[#2d3b56]">
                  <h3 className="text-[#111418] dark:text-white text-base font-bold leading-tight flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-primary">
                      <MdContactMail size={18} />
                    </span>
                    Personal Details
                  </h3>
                  <button
                    onClick={() => handleOpenEditModal("personal")}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    <BiEdit size={14} /> Edit
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Full Name */}
                  <div className="flex items-start gap-3">
                    <div className="mt-1 bg-slate-50 dark:bg-slate-800 p-2 rounded-xl text-slate-500">
                      <MdAccountCircle size={18} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[#637588] dark:text-[#92a4c9] text-xs font-semibold uppercase tracking-wider">
                        Full Name
                      </span>
                      <span className="text-[#111418] dark:text-white font-semibold text-sm mt-0.5">
                        {store_owner.first_name || ""} {store_owner.last_name || ""}
                      </span>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-3">
                    <div className="mt-1 bg-slate-50 dark:bg-slate-800 p-2 rounded-xl text-slate-500">
                      <MdMail size={18} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[#637588] dark:text-[#92a4c9] text-xs font-semibold uppercase tracking-wider">
                        Email Address
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[#111418] dark:text-white font-semibold text-sm">
                          {store_owner.email || "Not provided"}
                        </span>
                        {store_owner.email && (
                          <span className="text-emerald-500" title="Verified Email">
                            <BiCheckCircle size={16} />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-3">
                    <div className="mt-1 bg-slate-50 dark:bg-slate-800 p-2 rounded-xl text-slate-500">
                      <MdPhoneCallback size={18} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[#637588] dark:text-[#92a4c9] text-xs font-semibold uppercase tracking-wider">
                        Phone Number
                      </span>
                      <span className="text-[#111418] dark:text-white font-semibold text-sm mt-0.5 font-mono">
                        {store_owner?.phone || "Not provided"}
                      </span>
                    </div>
                  </div>

                  {/* Gender */}
                  <div className="flex items-start gap-3">
                    <div className="mt-1 bg-slate-50 dark:bg-slate-800 p-2 rounded-xl text-slate-500">
                      <MdWc size={18} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[#637588] dark:text-[#92a4c9] text-xs font-semibold uppercase tracking-wider">
                        Gender
                      </span>
                      <span className="text-[#111418] dark:text-white font-semibold text-sm mt-0.5 capitalize">
                        {store_owner.gender || "Not specified"}
                      </span>
                    </div>
                  </div>

                  {/* Date of Birth */}
                  <div className="flex items-start gap-3">
                    <div className="mt-1 bg-slate-50 dark:bg-slate-800 p-2 rounded-xl text-slate-500">
                      <MdCake size={18} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[#637588] dark:text-[#92a4c9] text-xs font-semibold uppercase tracking-wider">
                        Date of Birth
                      </span>
                      <span className="text-[#111418] dark:text-white font-semibold text-sm mt-0.5">
                        {store_owner.date_of_birth ? formatDateTime(store_owner.date_of_birth, "date") : "Not provided"}
                      </span>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-3">
                    <div className="mt-1 bg-slate-50 dark:bg-slate-800 p-2 rounded-xl text-slate-500">
                      <MdLocationOn size={18} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[#637588] dark:text-[#92a4c9] text-xs font-semibold uppercase tracking-wider">
                        Physical Address
                      </span>
                      <span className="text-[#111418] dark:text-white font-semibold text-sm mt-0.5">
                        {store_owner.address || "Not provided"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Details & Operations Card */}
            <div className="bg-white dark:bg-[#232f48] rounded-2xl p-6 border border-slate-200 dark:border-[#324467] shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100 dark:border-[#2d3b56]">
                  <h3 className="text-[#111418] dark:text-white text-base font-bold leading-tight flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                      <MdAdminPanelSettings size={18} />
                    </span>
                    Account Management & Security
                  </h3>
                  <button
                    onClick={() => handleOpenEditModal("account")}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    <BiEdit size={14} /> Manage
                  </button>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-[#2d3b56]">
                  <div className="flex justify-between items-center py-3">
                    <span className="text-[#637588] dark:text-[#92a4c9] text-xs font-semibold">
                      Account Status
                    </span>
                    <StatusBadge account_status={store_owner.account_status} />
                  </div>

                  <div className="flex justify-between items-center py-3">
                    <span className="text-[#637588] dark:text-[#92a4c9] text-xs font-semibold">
                      Verification Status
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide border ${
                        store_owner.verification_status === VERIFICATION_STATUS.VERIFIED
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                          : store_owner.verification_status === VERIFICATION_STATUS.REJECTED
                          ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
                          : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                      }`}
                    >
                      {store_owner.verification_status || "PENDING"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-3">
                    <span className="text-[#637588] dark:text-[#92a4c9] text-xs font-semibold">
                      Last Login
                    </span>
                    <span className="text-[#111418] dark:text-white font-semibold text-xs">
                      {store_owner.last_login_at ? formatDateTime(store_owner.last_login_at) : "Never"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-3">
                    <span className="text-[#637588] dark:text-[#92a4c9] text-xs font-semibold">
                      Last Active
                    </span>
                    <span className="text-[#111418] dark:text-white font-semibold text-xs">
                      {store_owner.last_active_at ? formatDateTime(store_owner.last_active_at) : "N/A"}
                    </span>
                  </div>

                  {store_owner.account_deactivated_reason && (
                    <div className="py-3">
                      <span className="text-rose-600 dark:text-rose-400 text-xs font-bold block mb-1">
                        Suspension / Deactivation Reason:
                      </span>
                      <p className="text-xs text-slate-700 dark:text-slate-300 bg-rose-50/50 dark:bg-rose-950/20 p-2.5 rounded-xl border border-rose-200/60 dark:border-rose-900/50">
                        {store_owner.account_deactivated_reason}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-between items-center py-3">
                    <span className="text-[#637588] dark:text-[#92a4c9] text-xs font-semibold">
                      Account Registered
                    </span>
                    <span className="text-[#111418] dark:text-white font-semibold text-xs">
                      {formatDateTime(store_owner.createdAt)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-3">
                    <span className="text-[#637588] dark:text-[#92a4c9] text-xs font-semibold">
                      Last Profile Update
                    </span>
                    <span className="text-[#111418] dark:text-white font-semibold text-xs">
                      {store_owner.updatedAt ? formatDateTime(store_owner.updatedAt) : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Bank & Settlement Credentials */}
        {activeTab === "bank" && (
          <div className="mt-6 pb-8 space-y-6">
            {/* Active Settlement Window & Instant Disbursement Panel */}
            <div className="bg-white dark:bg-[#232f48] rounded-2xl p-6 border border-slate-200 dark:border-[#324467] shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 mb-5 border-b border-slate-100 dark:border-[#2d3b56]">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-primary border border-blue-100 dark:border-blue-900/50">
                    <MdElectricBolt size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        Monthly Settlement & Instant Payout
                      </h3>
                      {settlementSummary?.cycleInfo?.isCustomWindow ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                          New Window Active (Post-Manual Settlement)
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          Standard Monthly Cycle
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Current Window:{" "}
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {settlementSummary?.cycleInfo?.currentWindowStart
                          ? new Date(settlementSummary.cycleInfo.currentWindowStart).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "1st"}{" "}
                        –{" "}
                        {settlementSummary?.cycleInfo?.currentWindowEnd
                          ? new Date(settlementSummary.cycleInfo.currentWindowEnd).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "Month End"}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {!bank?.isVerified && (bank?.accountNumber || bank?.upiId) && (
                    <button
                      onClick={handleVerifyBank}
                      disabled={isVerifyingBank}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-600/30 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      <MdVerifiedUser size={15} />
                      <span>{isVerifyingBank ? "Verifying..." : "Verify Bank Account"}</span>
                    </button>
                  )}
                  <button
                    onClick={() => setIsSettlementModalOpen(true)}
                    disabled={!settlementSummary?.pendingSettlement?.isEligibleForDisbursement || isSettling}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                      settlementSummary?.pendingSettlement?.isEligibleForDisbursement
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/20"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                    }`}
                  >
                    <MdElectricBolt size={15} className={settlementSummary?.pendingSettlement?.isEligibleForDisbursement ? "text-amber-300 animate-pulse" : ""} />
                    <span>{isSettling ? "Processing..." : "Settle Now (Manual Payout)"}</span>
                  </button>
                </div>
              </div>

              {/* Settlement Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
                  <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block">
                    Pending Net Payout
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
                      ₹{settlementSummary?.pendingSettlement?.netAmount ?? 0}
                    </span>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      ({settlementSummary?.pendingSettlement?.earningsCount ?? 0} bookings)
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1c2438] border border-slate-100 dark:border-[#2d3b56]">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    Gross Storage Earnings
                  </span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white mt-1 block">
                    ₹{settlementSummary?.pendingSettlement?.grossAmount ?? 0}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1c2438] border border-slate-100 dark:border-[#2d3b56]">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    Platform Commission Deducted
                  </span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white mt-1 block">
                    ₹{settlementSummary?.pendingSettlement?.commissionDeducted ?? 0}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1c2438] border border-slate-100 dark:border-[#2d3b56]">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    Last Settled At
                  </span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1.5 block">
                    {settlementSummary?.cycleInfo?.lastSettledAt
                      ? formatDateTime(settlementSummary.cycleInfo.lastSettledAt)
                      : "Never"}
                  </span>
                  {settlementSummary?.cycleInfo?.lastSettlementType && (
                    <span className="text-[10px] text-slate-500 font-medium">
                      Type: {settlementSummary.cycleInfo.lastSettlementType}
                    </span>
                  )}
                </div>
              </div>

              {/* Informative helper callout */}
              {!settlementSummary?.pendingSettlement?.isEligibleForDisbursement && (
                <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
                  <MdInfoOutline size={16} className="shrink-0" />
                  <span>
                    Manual payout currently inactive:{" "}
                    <strong>{settlementSummary?.pendingSettlement?.ineligibilityReason || "No pending earnings"}</strong>
                  </span>
                </div>
              )}
            </div>

            {/* Bank Credentials Card */}
            <div className="bg-white dark:bg-[#232f48] rounded-2xl p-6 border border-slate-200 dark:border-[#324467] shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-5 border-b border-slate-100 dark:border-[#2d3b56]">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border border-teal-100 dark:border-teal-900/50">
                    <MdAccountBalance size={24} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Payout & Settlement Credentials
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Target bank account for automated RazorpayX IMPS/UPI monthly settlements.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {bank?.isVerified ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <MdVerifiedUser size={14} />
                      Verified for Disbursement
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      Pending Verification
                    </span>
                  )}
                  <button
                    onClick={() => handleOpenEditModal("bank")}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <BiEdit size={14} />
                    <span>Edit Bank Details</span>
                  </button>
                </div>
              </div>

              {bank?.accountNumber ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {/* Beneficiary Name */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1c2438] border border-slate-100 dark:border-[#2d3b56]">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      Beneficiary Account Name
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white mt-1 block">
                      {bank.beneficiaryName || "Not provided"}
                    </span>
                  </div>

                  {/* Account Number */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1c2438] border border-slate-100 dark:border-[#2d3b56]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Bank Account Number
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setShowAccountMask(!showAccountMask)}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                          title={showAccountMask ? "Mask account number" : "Show account number"}
                        >
                          {showAccountMask ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopy(bank.accountNumber || "", "account")}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                          title="Copy account number"
                        >
                          {copiedKey === "account" ? <BiCheck size={16} className="text-emerald-500" /> : <BiCopy size={15} />}
                        </button>
                      </div>
                    </div>
                    <span className="text-sm font-bold font-mono text-slate-900 dark:text-white mt-1 block tracking-wider">
                      {showAccountMask || !bank.accountNumber
                        ? bank.accountNumber
                        : `•••• •••• ${bank.accountNumber.slice(-4)}`}
                    </span>
                  </div>

                  {/* IFSC Code */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1c2438] border border-slate-100 dark:border-[#2d3b56]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Bank IFSC Code
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(bank.ifscCode || "", "ifsc")}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        title="Copy IFSC code"
                      >
                        {copiedKey === "ifsc" ? <BiCheck size={16} className="text-emerald-500" /> : <BiCopy size={15} />}
                      </button>
                    </div>
                    <span className="text-sm font-bold font-mono uppercase text-slate-900 dark:text-white mt-1 block">
                      {bank.ifscCode || "Not provided"}
                    </span>
                  </div>

                  {/* Preferred Mode */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1c2438] border border-slate-100 dark:border-[#2d3b56]">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      Disbursement Mode
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white mt-1 block">
                      {bank.preferredMode || "IMPS"} (Automated Payout)
                    </span>
                  </div>

                  {/* UPI ID */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1c2438] border border-slate-100 dark:border-[#2d3b56]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        UPI ID (VPA)
                      </span>
                      {bank.upiId && (
                        <button
                          type="button"
                          onClick={() => handleCopy(bank.upiId || "", "upi")}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                          title="Copy UPI ID"
                        >
                          {copiedKey === "upi" ? <BiCheck size={16} className="text-emerald-500" /> : <BiCopy size={15} />}
                        </button>
                      )}
                    </div>
                    <span className="text-sm font-bold font-mono text-slate-900 dark:text-white mt-1 block">
                      {bank.upiId || "Not provided"}
                    </span>
                  </div>

                  {/* Verification Metadata */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1c2438] border border-slate-100 dark:border-[#2d3b56]">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      Verification Record
                    </span>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-1 block">
                      {bank.isVerified
                        ? `Verified on ${bank.verifiedAt ? formatDateTime(bank.verifiedAt) : "N/A"}`
                        : "Requires Admin Review"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center bg-slate-50 dark:bg-[#1c2438] rounded-xl border border-dashed border-slate-200 dark:border-[#2d3b56]">
                  <MdAccountBalance size={36} className="mx-auto text-slate-400 mb-2" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    No Bank Credentials Configured
                  </p>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    This store owner has not registered bank details yet. As Admin, you can add them to ensure settlements disburse smoothly.
                  </p>
                  <button
                    onClick={() => handleOpenEditModal("bank")}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-xs hover:bg-blue-700 transition-all cursor-pointer"
                  >
                    <BiEdit size={14} />
                    <span>Add Bank Details</span>
                  </button>
                </div>
              )}
            </div>

            {/* Recent Settlements History Table */}
            <div className="bg-white dark:bg-[#232f48] rounded-2xl p-6 border border-slate-200 dark:border-[#324467] shadow-xs">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-[#2d3b56]">
                <div className="flex items-center gap-2">
                  <MdHistory size={20} className="text-primary" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Settlement & Payout History
                  </h3>
                </div>
                <button
                  onClick={() => refetchSettlement()}
                  className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                >
                  Refresh
                </button>
              </div>

              {settlementSummary?.recentPayouts && settlementSummary.recentPayouts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-[#2d3b56] text-slate-400 font-semibold uppercase">
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Cycle Type</th>
                        <th className="py-2.5 px-3">Period Range</th>
                        <th className="py-2.5 px-3">Net Amount</th>
                        <th className="py-2.5 px-3">Mode</th>
                        <th className="py-2.5 px-3">Transfer / Ref ID</th>
                        <th className="py-2.5 px-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-[#2d3b56]">
                      {settlementSummary.recentPayouts.map((payout) => (
                        <tr key={payout._id} className="hover:bg-slate-50 dark:hover:bg-[#1f293d]">
                          <td className="py-3 px-3 font-medium text-slate-900 dark:text-white">
                            {formatDateTime(payout.createdAt)}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                payout.cycleType === "MANUAL"
                                  ? "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                                  : "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                              }`}
                            >
                              {payout.cycleType}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-500 dark:text-slate-400 text-[11px]">
                            {new Date(payout.cycleStart).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} –{" "}
                            {new Date(payout.cycleEnd).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </td>
                          <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                            ₹{payout.amount}
                          </td>
                          <td className="py-3 px-3 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                            {payout.payoutMode}
                          </td>
                          <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                            {payout.providerTransferId || "N/A"}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                payout.status === "DISBURSED"
                                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                                  : payout.status === "TRANSFER_FAILED"
                                  ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                                  : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                              }`}
                            >
                              {payout.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400">
                  <p className="text-xs">No prior payouts or settlement records found for this store owner.</p>
                </div>
              )}
            </div>

            {/* Security Alert Banner */}
            <div className="p-4 bg-slate-50 dark:bg-[#232f48] border border-slate-200 dark:border-[#324467] rounded-2xl flex items-start gap-3">
              <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-primary shrink-0">
                <MdVerifiedUser size={18} />
              </span>
              <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <p className="font-bold text-slate-800 dark:text-slate-100">Role Separation & Compliance Notice</p>
                <p className="mt-0.5 text-slate-500 dark:text-slate-400">
                  Store owners cannot edit bank details directly from their partner dashboard to safeguard payout revenue. Only Admin CRM (Admin, Super Admin, Customer Support) has the authority to update or verify these credentials.
                </p>
              </div>
            </div>
          </div>
        )}

      {/* Manual Settlement Confirmation Modal */}
      {isSettlementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#232f48] w-full max-w-md rounded-2xl border border-slate-200 dark:border-[#324467] shadow-2xl p-6 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-100 dark:border-[#2d3b56]">
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-primary">
                <MdElectricBolt size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Confirm Instant Settlement
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Disburse pending earnings immediately to store owner
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1c2438] border border-slate-100 dark:border-[#2d3b56] space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Store Owner:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {store_owner.first_name} {store_owner.last_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Beneficiary:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">
                    {bank?.beneficiaryName || `${store_owner.first_name} ${store_owner.last_name}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Account / UPI:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {bank?.accountNumber || bank?.upiId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Storage Bookings:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {settlementSummary?.pendingSettlement?.earningsCount ?? 0}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-[#2d3b56] text-sm font-black text-emerald-600 dark:text-emerald-400">
                  <span>Total Net Payout:</span>
                  <span>₹{settlementSummary?.pendingSettlement?.netAmount ?? 0}</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">
                  Settlement Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mid-month ad-hoc settlement"
                  value={settlementNote}
                  onChange={(e) => setSettlementNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#1c2438] border border-slate-200 dark:border-[#324467] text-slate-900 dark:text-white text-xs outline-hidden focus:border-primary"
                />
              </div>

              <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/50 text-blue-800 dark:text-blue-300 leading-relaxed text-[11px]">
                <strong>Window Transition:</strong> Upon disbursement, this store owner&apos;s new monthly settlement window will automatically begin from <strong>tomorrow (00:00:00)</strong> through the end of the month.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-[#2d3b56]">
              <button
                type="button"
                onClick={() => setIsSettlementModalOpen(false)}
                disabled={isSettling}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleManualSettlementSubmit}
                disabled={isSettling}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-primary hover:bg-blue-700 shadow-md shadow-primary/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {isSettling ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    <span>Disbursing...</span>
                  </>
                ) : (
                  <>
                    <MdElectricBolt size={14} className="text-amber-300" />
                    <span>Confirm & Disburse ₹{settlementSummary?.pendingSettlement?.netAmount ?? 0}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

        {/* Tab 3: Stores Managed */}
        {activeTab === "stores" && (
          <div className="mt-6 pb-8 space-y-6">
            {/* Store Metrics Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-white dark:bg-[#232f48] rounded-xl border border-slate-200 dark:border-[#324467] shadow-xs">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Total Stores
                </span>
                <span className="text-2xl font-bold text-slate-900 dark:text-white mt-1 block">
                  {store_owner.store_count ?? stores.length}
                </span>
              </div>

              <div className="p-4 bg-white dark:bg-[#232f48] rounded-xl border border-slate-200 dark:border-[#324467] shadow-xs">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Active Stores
                </span>
                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
                  {store_owner.activeStoreCount ?? 0}
                </span>
              </div>

              <div className="p-4 bg-white dark:bg-[#232f48] rounded-xl border border-slate-200 dark:border-[#324467] shadow-xs">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Inactive Stores
                </span>
                <span className="text-2xl font-bold text-slate-500 dark:text-slate-400 mt-1 block">
                  {store_owner.inactiveStoreCount ?? 0}
                </span>
              </div>
            </div>

            {/* Stores List */}
            <div className="bg-white dark:bg-[#232f48] rounded-2xl p-6 border border-slate-200 dark:border-[#324467] shadow-xs">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <MdStore size={20} className="text-primary" />
                <span>Associated Store Outlets</span>
              </h3>

              {stores.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {stores.map((st: any) => (
                    <div
                      key={st._id}
                      className="p-4 rounded-xl border border-slate-100 dark:border-[#2d3b56] bg-slate-50/50 dark:bg-[#1c2438] flex flex-col justify-between hover:border-blue-300 transition-colors"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                            {st.store_name}
                          </h4>
                          <StatusBadge account_status={st.account_status} />
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
                          ID: {st._id}
                        </p>
                        {st.location?.address && (
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 flex items-center gap-1">
                            <MdLocationOn size={14} className="shrink-0 text-slate-400" />
                            <span className="truncate">{st.location.address}</span>
                          </p>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#2d3b56] flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500">
                          {st.is_online ? "🟢 Online" : "⚪ Offline"}
                        </span>
                        <Link
                          href={`/store/${st._id}`}
                          className="text-xs font-bold text-primary hover:underline"
                        >
                          View Store →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No stores associated with this owner account yet.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Edit Store Owner Multi-Tab Sliding Drawer */}
      <EditStoreOwnerDetails
        showEditModal={showEditModal}
        store_owner={store_owner}
        initialTab={editModalTab}
        isSubmitting={isUpdating}
        onClose={() => setShowEditModal(false)}
        handleSubmit={handleSubmit}
      />
    </div>
  );
};

export default StoreOwnerDetail;
