"use client";

import { useState } from "react";
import {
  BiBadge,
  BiEdit,
  BiHome,
  BiRefresh,
} from "react-icons/bi";
import {
  MdAccountBox,
  MdAccountCircle,
  MdContactMail,
  MdAccessTime,
  MdInventory2,
  MdAdminPanelSettings,
  MdPhone,
} from "react-icons/md";
import { BsFillCalendarMonthFill } from "react-icons/bs";
import { FaStore, FaUser } from "react-icons/fa";
import Link from "next/link";
import NoData from "@/app/NoData";
import { formatDateTime } from "@/app/utils/helper";
import {
  useGetStoreQuery,
  useUpdateStoreMutation,
  useUpdateLocationMutation,
  useToggleStoreDutyMutation,
  useReleaseStoreCapacityMutation,
} from "../../../../services/storeApi";
import { useToast } from "../../../../hooks/useToast";
import { StatusBadge } from "../../../../components/common/StatusBadge";
import { StoreUpdateData } from "@/app/types/store";
import { StoreDetailSkeleton } from "@/app/loading/store";
import { EditStoreDetails } from "@/app/components/store";
import UpdateStoreCurrentLocation from "@/app/components/store/UpdateStoreCurrentLocation";
import Toggle from "@/app/components/common/Toggle";
import { VERIFICATION_STATUS } from "@/app/enum";

const StoreDetail = ({ store_id }: { store_id: string }) => {
  const toast = useToast();
  const { data, isLoading, isError, refetch } = useGetStoreQuery(store_id);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editModalTab, setEditModalTab] = useState<"details" | "capacity" | "operations">("details");
  const [activeTab, setActiveTab] = useState<"overview" | "capacity" | "account">("overview");
  const [lastCheckedTime, setLastCheckedTime] = useState<string | null>(null);

  const store = data?.data;

  const [updateStore, { isLoading: isUpdating }] = useUpdateStoreMutation();
  const [updateStoreLocation] = useUpdateLocationMutation();
  const [updateStoreOnline] = useToggleStoreDutyMutation();
  const [releaseStoreCapacity, { isLoading: isReleasingCapacity }] = useReleaseStoreCapacityMutation();

  const handleOpenEditModal = (tab: "details" | "capacity" | "operations") => {
    setEditModalTab(tab);
    setShowEditModal(true);
  };

  const handleSubmit = async (formData: StoreUpdateData) => {
    try {
      await updateStore({ storeId: store_id, data: formData }).unwrap();
      toast.success("Store details updated successfully");
      setShowEditModal(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update store");
    }
  };


  const handleToggleStoreDuty = async (checked: boolean) => {
    try {
      await updateStoreOnline({ storeId: store_id, is_online: checked }).unwrap();
      toast.success(`Store is now ${checked ? "online" : "offline"}`);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update store duty");
    }
  };

  const handleRefreshCapacity = async () => {
    try {
      const res = await releaseStoreCapacity({ storeId: store_id }).unwrap();
      await refetch();
      const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setLastCheckedTime(now);

      const occupied = res?.data?.current_booking_count ?? (Number(store?.current_booking_count) || 0);
      const freeSlots = res?.data?.available_capacity ?? Math.max(0, (Number(store?.max_booking_capacity) || 50) - occupied);
      const maxSlots = res?.data?.max_booking_capacity ?? (Number(store?.max_booking_capacity) || 50);

      toast.success(
        `Capacity verified: ${occupied} bags occupied, ${freeSlots} free slots available of ${maxSlots} total capacity`
      );
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to check and refresh capacity");
    }
  };

  if (isLoading) return <StoreDetailSkeleton />;
  if (isError || !store) return <NoData />;

  const maxCap = Number(store.max_booking_capacity) || 50;
  const currOcc = Number(store.current_booking_count) || 0;
  const availCap = Math.max(0, maxCap - currOcc);
  const occupancyPercent = maxCap > 0 ? Math.min(100, Math.round((currOcc / maxCap) * 100)) : 0;

  const owner = store.store_owner_id;
  const ownerName = owner && typeof owner === "object"
    ? `${owner.first_name || ""} ${owner.last_name || ""}`.trim() || "Store Owner"
    : "Store Owner";

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

        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white dark:bg-[#232f48] p-5 rounded-2xl border border-slate-200 dark:border-[#324467] shadow-xs shrink-0">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 items-start sm:items-center">
            <div className="flex items-center justify-center h-16 w-16 shrink-0 bg-blue-50 dark:bg-[#1a2333] text-primary border border-blue-100 dark:border-[#324467] rounded-2xl font-bold text-xl shadow-xs">
              <p>{store?.store_name?.[0]?.toUpperCase() || "S"}</p>
            </div>
            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-[#111418] dark:text-white text-2xl sm:text-3xl font-bold leading-tight">
                  {store.store_name}
                </h1>
                <StatusBadge account_status={store.account_status} />
                <span
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                    store?.is_online
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800"
                      : "bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${store?.is_online ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                  {store?.is_online ? "Online (Accepting)" : "Offline"}
                </span>
                {store?.verification_status && (
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                      store.verification_status === VERIFICATION_STATUS.VERIFIED
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                        : store.verification_status === VERIFICATION_STATUS.REJECTED
                        ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
                        : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                    }`}
                  >
                    {store.verification_status}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-[#637588] dark:text-[#92a4c9] text-[13px] mt-1">
                <p className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[17px]">
                    <BiBadge />
                  </span>
                  <span>Store ID: <code className="font-mono">{store?._id}</code></span>
                </p>
                <p className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[17px]">
                    <BsFillCalendarMonthFill />
                  </span>
                  <span>Joined {formatDateTime(store?.createdAt)}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto">
            <button
              onClick={() => handleOpenEditModal("details")}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 cursor-pointer rounded-xl h-10 px-4 bg-primary hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <BiEdit size={16} />
              <span>Edit Store</span>
            </button>
            <div className="px-2">
              <Toggle checked={store.is_online} onChange={handleToggleStoreDuty} labelOn="Online" labelOff="Offline" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 border-b border-slate-200 dark:border-[#324467] mt-6 shrink-0">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "overview"
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <FaStore size={14} />
            <span>Store Details & Hours</span>
          </button>
          <button
            onClick={() => setActiveTab("capacity")}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "capacity"
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <MdInventory2 size={16} />
            <span>Capacity & Space Management</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
              {availCap} slots free
            </span>
          </button>
          <button
            onClick={() => setActiveTab("account")}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "account"
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <MdAdminPanelSettings size={16} />
            <span>Security & Location</span>
          </button>
        </div>

        {/* Tab 1: Store Details & Hours */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 pb-8">
            {/* Contact Information Card */}
            <div className="bg-white dark:bg-[#232f48] rounded-2xl p-6 border border-slate-200 dark:border-[#324467] shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100 dark:border-[#2d3b56]">
                  <h3 className="text-[#111418] dark:text-white text-base font-bold leading-tight flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-primary">
                      <MdContactMail size={18} />
                    </span>
                    Contact & Operating Info
                  </h3>
                  <button
                    onClick={() => handleOpenEditModal("details")}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    <BiEdit size={14} /> Edit
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Store Name */}
                  <div className="flex items-start gap-3">
                    <div className="mt-1 bg-slate-50 dark:bg-slate-800 p-2 rounded-xl text-slate-500">
                      <FaStore size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[#637588] dark:text-[#92a4c9] text-xs font-semibold uppercase tracking-wider">
                        Store Name
                      </span>
                      <span className="text-[#111418] dark:text-white font-semibold text-sm mt-0.5">
                        {store.store_name}
                      </span>
                    </div>
                  </div>

                  {/* Registered Phone */}
                  <div className="flex items-start gap-3">
                    <div className="mt-1 bg-slate-50 dark:bg-slate-800 p-2 rounded-xl text-slate-500">
                      <MdPhone size={18} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[#637588] dark:text-[#92a4c9] text-xs font-semibold uppercase tracking-wider">
                        Registered Mobile Number
                      </span>
                      <span className="text-[#111418] dark:text-white font-semibold text-sm mt-0.5 font-mono">
                        {store.phone}
                      </span>
                    </div>
                  </div>

                  {/* Contact Number */}
                  <div className="flex items-start gap-3">
                    <div className="mt-1 bg-slate-50 dark:bg-slate-800 p-2 rounded-xl text-slate-500">
                      <MdPhone size={18} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[#637588] dark:text-[#92a4c9] text-xs font-semibold uppercase tracking-wider">
                        Store Contact Number
                      </span>
                      <span className="text-[#111418] dark:text-white font-semibold text-sm mt-0.5 font-mono">
                        {store.store_contact_number || "Not provided"}
                      </span>
                    </div>
                  </div>

                  {/* Operating Hours */}
                  <div className="flex items-start gap-3">
                    <div className="mt-1 bg-slate-50 dark:bg-slate-800 p-2 rounded-xl text-slate-500">
                      <MdAccessTime size={18} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[#637588] dark:text-[#92a4c9] text-xs font-semibold uppercase tracking-wider">
                        Operating Hours
                      </span>
                      <span className="text-[#111418] dark:text-white font-semibold text-sm mt-0.5 font-mono">
                        {store.store_open_time || "08:00"} - {store.store_close_time || "22:00"}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  {store.store_description && (
                    <div className="pt-2 border-t border-slate-100 dark:border-[#2d3b56]">
                      <span className="text-[#637588] dark:text-[#92a4c9] text-xs font-semibold uppercase tracking-wider block mb-1">
                        Store Description / Landmarks
                      </span>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-[#1c2438] p-3 rounded-xl border border-slate-100 dark:border-[#2d3b56]">
                        {store.store_description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Store Owner Details Card */}
            <div className="bg-white dark:bg-[#232f48] rounded-2xl p-6 border border-slate-200 dark:border-[#324467] shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100 dark:border-[#2d3b56]">
                  <h3 className="text-[#111418] dark:text-white text-base font-bold leading-tight flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                      <MdAccountBox size={18} />
                    </span>
                    Associated Store Owner
                  </h3>
                  {owner?._id && (
                    <Link
                      href={`/storeowner/${owner._id}`}
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      View Owner Profile →
                    </Link>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Owner Name */}
                  <div className="flex items-start gap-3">
                    <div className="mt-1 bg-slate-50 dark:bg-slate-800 p-2 rounded-xl text-slate-500">
                      <FaUser size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[#637588] dark:text-[#92a4c9] text-xs font-semibold uppercase tracking-wider">
                        Owner Name
                      </span>
                      <span className="text-[#111418] dark:text-white font-semibold text-sm mt-0.5">
                        {ownerName}
                      </span>
                    </div>
                  </div>

                  {/* Owner Email */}
                  <div className="flex items-start gap-3">
                    <div className="mt-1 bg-slate-50 dark:bg-slate-800 p-2 rounded-xl text-slate-500">
                      <MdAccountCircle size={18} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[#637588] dark:text-[#92a4c9] text-xs font-semibold uppercase tracking-wider">
                        Owner Email
                      </span>
                      <span className="text-[#111418] dark:text-white font-semibold text-sm mt-0.5">
                        {owner?.email || "Not available"}
                      </span>
                    </div>
                  </div>

                  {/* Owner Phone */}
                  <div className="flex items-start gap-3">
                    <div className="mt-1 bg-slate-50 dark:bg-slate-800 p-2 rounded-xl text-slate-500">
                      <MdPhone size={18} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[#637588] dark:text-[#92a4c9] text-xs font-semibold uppercase tracking-wider">
                        Owner Contact Number
                      </span>
                      <span className="text-[#111418] dark:text-white font-semibold text-sm mt-0.5 font-mono">
                        {owner?.phone || "Not available"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Capacity & Space Management */}
        {activeTab === "capacity" && (
          <div className="mt-6 pb-8 space-y-6">
            <div className="bg-white dark:bg-[#232f48] rounded-2xl p-6 border border-slate-200 dark:border-[#324467] shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-5 border-b border-slate-100 dark:border-[#2d3b56]">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
                    <MdInventory2 size={24} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Luggage Storage Capacity & Space Control
                    </h3>
                    {lastCheckedTime ? (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Live load verified at {lastCheckedTime}</span>
                        <span>&bull; All slots reconciled</span>
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Real-time active booking tracking & warehouse load reconciliation
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRefreshCapacity}
                    disabled={isReleasingCapacity}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#1c2438] dark:hover:bg-[#283550] border border-slate-200 dark:border-[#324467] text-slate-800 dark:text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
                    title="Check database active bookings and refresh real-time capacity load"
                  >
                    <BiRefresh size={16} className={isReleasingCapacity ? "animate-spin text-primary" : "text-primary"} />
                    <span>{isReleasingCapacity ? "Checking Load..." : "Refresh & Check Load"}</span>
                  </button>
                  <button
                    onClick={() => handleOpenEditModal("capacity")}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <BiEdit size={14} />
                    <span>Edit Capacity</span>
                  </button>
                </div>
              </div>

              {/* Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
                {/* Currently Occupied */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#1c2438] border border-slate-100 dark:border-[#2d3b56] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                        Currently Occupied
                      </span>
                      {occupancyPercent >= 90 ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                          Near Full
                        </span>
                      ) : occupancyPercent >= 60 ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
                          Moderate Load
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                          Optimal Load
                        </span>
                      )}
                    </div>
                    <span className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-2 block font-mono">
                      {currOcc} <span className="text-sm font-normal text-slate-400">Bags</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-200/60 dark:border-[#2d3b56]">
                    Active luggage stored in warehouse
                  </p>
                </div>

                {/* Available Free Slots */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#1c2438] border border-slate-100 dark:border-[#2d3b56] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                        Available Free Slots
                      </span>
                      {availCap > 0 ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                          Accepting Bags
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                          Store Full
                        </span>
                      )}
                    </div>
                    <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2 block font-mono">
                      {availCap} <span className="text-sm font-normal text-slate-400">Slots</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-200/60 dark:border-[#2d3b56]">
                    Remaining capacity for new bookings
                  </p>
                </div>

                {/* Total Maximum Capacity */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#1c2438] border border-slate-100 dark:border-[#2d3b56] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                        Total Maximum Capacity
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                        Warehouse Ceiling
                      </span>
                    </div>
                    <span className="text-3xl font-black text-slate-900 dark:text-white mt-2 block font-mono">
                      {maxCap} <span className="text-sm font-normal text-slate-400">Bags</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-200/60 dark:border-[#2d3b56]">
                    Hard limit configured for this store
                  </p>
                </div>
              </div>

              {/* Visual Utilization Progress Bar */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-[#2d3b56] bg-slate-50/50 dark:bg-[#232d46]/30">
                <div className="flex items-center justify-between text-xs font-bold mb-2.5">
                  <span className="text-slate-700 dark:text-slate-200">Capacity Occupancy Rate</span>
                  <span className="text-blue-600 dark:text-blue-400 font-mono">{occupancyPercent}% Utilized</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      occupancyPercent >= 90
                        ? "bg-rose-500"
                        : occupancyPercent >= 70
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                    style={{ width: `${occupancyPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 mt-3">
                  <span>0 Bags</span>
                  <span>{Math.round(maxCap / 2)} Bags</span>
                  <span>{maxCap} Bags Max</span>
                </div>
              </div>

              {/* Operational Release Explanation Banner */}
              <div className="mt-6 p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 flex items-start gap-3">
                <BiRefresh size={20} className="text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  <p className="font-bold text-slate-800 dark:text-slate-100">Automatic Capacity Re-synchronization</p>
                  <p className="mt-0.5 text-slate-500 dark:text-slate-400">
                    If completed, cancelled, or collected luggage bookings ever get desynchronized, clicking <strong className="text-emerald-700 dark:text-emerald-400">"Release / Sync Capacity"</strong> automatically queries all confirmed in-progress bookings, recalculates actual bags currently in the store, and instantly releases any stuck capacity slots.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Security & Location */}
        {activeTab === "account" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 pb-8">
            <div className="bg-white dark:bg-[#232f48] rounded-2xl p-6 border border-slate-200 dark:border-[#324467] shadow-xs">
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100 dark:border-[#2d3b56]">
                <h3 className="text-[#111418] dark:text-white text-base font-bold leading-tight flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                    <MdAdminPanelSettings size={18} />
                  </span>
                  Account & Operational Security
                </h3>
                <button
                  onClick={() => handleOpenEditModal("operations")}
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
                  <StatusBadge account_status={store.account_status} />
                </div>

                <div className="flex justify-between items-center py-3">
                  <span className="text-[#637588] dark:text-[#92a4c9] text-xs font-semibold">
                    Verification Status
                  </span>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide border ${
                      store.verification_status === VERIFICATION_STATUS.VERIFIED
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                        : store.verification_status === VERIFICATION_STATUS.REJECTED
                        ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
                        : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                    }`}
                  >
                    {store.verification_status}
                  </span>
                </div>

                <div className="flex justify-between items-center py-3">
                  <span className="text-[#637588] dark:text-[#92a4c9] text-xs font-semibold">
                    Store Visibility (Duty)
                  </span>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      store?.is_online
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                        : "bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {store?.is_online ? "Online" : "Offline"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-3">
                  <span className="text-[#637588] dark:text-[#92a4c9] text-xs font-semibold">
                    Serviceable in Boundary
                  </span>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide border ${
                      store.location?.is_serviceable
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                        : "bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {store.location?.is_serviceable ? "Yes" : "No"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-3">
                  <span className="text-[#637588] dark:text-[#92a4c9] text-xs font-semibold">
                    Last Active
                  </span>
                  <span className="text-[#111418] dark:text-white font-semibold text-xs">
                    {store.last_active_at ? formatDateTime(store.last_active_at) : "N/A"}
                  </span>
                </div>

                {store.store_deactivated_reason && (
                  <div className="py-3">
                    <span className="text-rose-600 dark:text-rose-400 text-xs font-bold block mb-1">
                      Deactivation Reason:
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 bg-rose-50/50 dark:bg-rose-950/20 p-2.5 rounded-xl border border-rose-200/60 dark:border-rose-900/50">
                      {store.store_deactivated_reason}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Location Management Card */}
            <div>
              <UpdateStoreCurrentLocation store={store} updateLocationMutation={updateStoreLocation} />
            </div>
          </div>
        )}
      </div>

      {/* Edit Store Multi-Tab Sliding Drawer */}
      <EditStoreDetails
        showEditModal={showEditModal}
        store={store}
        initialTab={editModalTab}
        isSubmitting={isUpdating}
        onClose={() => setShowEditModal(false)}
        handleSubmit={handleSubmit}
      />
    </div>
  );
};

export default StoreDetail;
