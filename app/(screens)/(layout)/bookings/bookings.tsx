"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FaCalendarAlt, FaEye } from "react-icons/fa";
import {
  BiSearch,
  BiFilter,
  BiX,
  BiUser,
  BiCheckCircle,
  BiTime,
  BiBlock,
} from "react-icons/bi";
import NoData from "@/app/NoData";
import { useGetBookingsQuery } from "../../../services/bookingApi";
import { Booking, BookingStatus, PopulatedUser, PopulatedStore } from "@/app/types/booking";
import { debounce } from "@/app/utils/helper";
import { TableSkeleton } from "@/app/components/common/Skeleton";
import Pagination from "@/app/components/common/Pagination";

import { getCurrencySymbol } from "@/app/utils/helper";

// ── Helpers ──
const getUserName = (userId: Booking["userId"]): string => {
  if (typeof userId === "string") return userId;
  return `${userId?.first_name || ""} ${userId?.last_name || ""}`.trim() || "—";
};

const getUserEmail = (userId: Booking["userId"]): string => {
  if (typeof userId === "string") return "";
  return userId?.email || "";
};

const getUserPhone = (userId: Booking["userId"]): string => {
  if (typeof userId === "string") return "";
  return userId?.phone || "";
};

const getUserInitial = (userId: Booking["userId"]): string => {
  if (typeof userId === "string") return "?";
  return (userId?.first_name?.charAt(0) || "?").toUpperCase();
};

const getStoreName = (storeId: Booking["storeId"]): string => {
  if (!storeId) return "—";
  if (typeof storeId === "string") return storeId;
  return storeId?.store_name || "—";
};

const getAssignedDriver = (booking: any) => {
  const isReturn = [
    "return_requested",
    "final_payment_captured",
    "return_driver_assigned",
    "out_for_return",
    "arrived_for_delivery",
  ].includes(booking.status);

  const driverObj = isReturn
    ? (typeof booking.delivery?.assignment?.driverId === "object" ? booking.delivery.assignment.driverId : null)
    : (typeof booking.pickup?.assignment?.driverId === "object" ? booking.pickup.assignment.driverId : null);

  if (driverObj) {
    const name = `${driverObj.first_name || ""} ${driverObj.last_name || ""}`.trim() || "Driver";
    return { name, phone: driverObj.phone, isAssigned: true, type: isReturn ? "Return" : "Pickup" };
  }
  return { name: "Unassigned", isAssigned: false };
};

const getBookingAmount = (booking: any) => {
  const currency = booking.pricing?.currency || booking.pricing?.pricingSnapshot?.currency || "INR";
  const currencySymbol = getCurrencySymbol(currency);
  const total = booking.pricing?.totalAmount || booking.pricing?.advanceAmount || 0;
  const payStatus = booking.payment?.status || (booking.status === "delivered" ? "paid" : "pending");
  return { currencySymbol, total, payStatus };
};

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
};

// ── Status Config ──
const STATUS_OPTIONS = [
  { label: "All Status", value: "", icon: <BiUser />, color: "text-slate-400" },
  { label: "Created", value: "created", icon: <BiTime />, color: "text-slate-500" },
  { label: "Payment Pending", value: "payment_pending", icon: <BiTime />, color: "text-amber-500" },
  { label: "Store Assigned", value: "store_assigned", icon: <BiCheckCircle />, color: "text-indigo-500" },
  { label: "Driver Assigned", value: "driver_assigned", icon: <BiCheckCircle />, color: "text-blue-500" },
  { label: "Driver Arrived", value: "driver_arrived", icon: <BiCheckCircle />, color: "text-cyan-500" },
  { label: "Picked Up", value: "picked_up", icon: <BiCheckCircle />, color: "text-teal-500" },
  { label: "At Store", value: "at_store", icon: <BiCheckCircle />, color: "text-purple-500" },
  { label: "Stored", value: "stored", icon: <BiCheckCircle />, color: "text-violet-500" },
  { label: "Return Requested", value: "return_requested", icon: <BiTime />, color: "text-amber-500" },
  { label: "Final Payment Pending", value: "final_payment_pending", icon: <BiTime />, color: "text-amber-500" },
  { label: "Final Payment Captured", value: "final_payment_captured", icon: <BiCheckCircle />, color: "text-emerald-500" },
  { label: "Return Driver Assigned", value: "return_driver_assigned", icon: <BiCheckCircle />, color: "text-orange-500" },
  { label: "Out for Return", value: "out_for_return", icon: <BiCheckCircle />, color: "text-sky-500" },
  { label: "Arrived for Delivery", value: "arrived_for_delivery", icon: <BiCheckCircle />, color: "text-lime-600" },
  { label: "Delivered", value: "delivered", icon: <BiCheckCircle />, color: "text-green-500" },
  { label: "Cancelled", value: "cancelled", icon: <BiBlock />, color: "text-red-500" },
  { label: "Driver Cancelled (Critical)", value: "driver_cancelled_critical", icon: <BiBlock />, color: "text-rose-500" },
] as const;

const STATUS_BADGE_MAP: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  created:                  { label: "Created",                dot: "bg-slate-400",   bg: "bg-slate-50 dark:bg-slate-500/10",    text: "text-slate-600 dark:text-slate-400" },
  payment_pending:          { label: "Payment Pending",        dot: "bg-amber-400",   bg: "bg-amber-50 dark:bg-amber-500/10",    text: "text-amber-700 dark:text-amber-400" },
  store_assigned:           { label: "Store Assigned",         dot: "bg-indigo-500",  bg: "bg-indigo-50 dark:bg-indigo-500/10",  text: "text-indigo-600 dark:text-indigo-400" },
  driver_assigned:          { label: "Driver Assigned",        dot: "bg-blue-500",    bg: "bg-blue-50 dark:bg-blue-500/10",      text: "text-blue-600 dark:text-blue-400" },
  driver_arrived:           { label: "Driver Arrived",         dot: "bg-cyan-500",    bg: "bg-cyan-50 dark:bg-cyan-500/10",      text: "text-cyan-600 dark:text-cyan-400" },
  picked_up:                { label: "Picked Up",              dot: "bg-teal-500",    bg: "bg-teal-50 dark:bg-teal-500/10",      text: "text-teal-600 dark:text-teal-400" },
  at_store:                 { label: "At Store",               dot: "bg-purple-500",  bg: "bg-purple-50 dark:bg-purple-500/10",  text: "text-purple-600 dark:text-purple-400" },
  stored:                   { label: "Stored in Vault",        dot: "bg-violet-500",  bg: "bg-violet-50 dark:bg-violet-500/10",  text: "text-violet-600 dark:text-violet-400" },
  return_requested:         { label: "Return Requested",       dot: "bg-amber-500",   bg: "bg-amber-50 dark:bg-amber-500/10",    text: "text-amber-600 dark:text-amber-400" },
  final_payment_pending:    { label: "Final Payment Due",      dot: "bg-amber-500",   bg: "bg-amber-50 dark:bg-amber-500/10",    text: "text-amber-700 dark:text-amber-400" },
  final_payment_captured:   { label: "Final Paid",             dot: "bg-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10",text: "text-emerald-600 dark:text-emerald-400" },
  return_driver_assigned:   { label: "Return Driver Assigned", dot: "bg-orange-500",  bg: "bg-orange-50 dark:bg-orange-500/10",  text: "text-orange-600 dark:text-orange-400" },
  out_for_return:           { label: "Out for Return",         dot: "bg-sky-500",     bg: "bg-sky-50 dark:bg-sky-500/10",        text: "text-sky-600 dark:text-sky-400" },
  arrived_for_delivery:     { label: "Arrived for Delivery",   dot: "bg-lime-500",    bg: "bg-lime-50 dark:bg-lime-500/10",      text: "text-lime-700 dark:text-lime-400" },
  delivered:                { label: "Delivered",              dot: "bg-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10",text: "text-emerald-600 dark:text-emerald-400" },
  cancelled:                { label: "Cancelled",              dot: "bg-red-500",     bg: "bg-red-50 dark:bg-red-500/10",        text: "text-red-600 dark:text-red-400" },
  driver_cancelled_critical:{ label: "Driver Cancelled",       dot: "bg-rose-600",    bg: "bg-rose-50 dark:bg-rose-500/10",      text: "text-rose-600 dark:text-rose-400" },
};

const getBookingStatusBadge = (status: string) => {
  const config = STATUS_BADGE_MAP[status] || { label: status, dot: "bg-slate-400", bg: "bg-slate-50 dark:bg-slate-500/10", text: "text-slate-600 dark:text-slate-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
      <span className={`size-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};

export default function BookingsClient() {
  const router = useRouter();
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });
  const [statusFilter, setStatusFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading, isFetching, isError } = useGetBookingsQuery({
    page: pagination.page,
    limit: pagination.limit,
    status: statusFilter || undefined,
    search: searchTerm || undefined,
  });

  const debouncedSearch = useMemo(
    () => debounce((value: string) => {
      setSearchTerm(value);
      setPagination((p) => ({ ...p, page: 1 }));
    }, 500),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
    debouncedSearch(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearchTerm("");
    setPagination((p) => ({ ...p, page: 1 }));
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setPagination((p) => ({ ...p, page: 1 }));
  };

  if (isLoading) return (
    <div className="flex-1 flex items-center justify-center bg-background p-8">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium animate-pulse">Loading bookings...</p>
      </div>
    </div>
  );
  if (isError || !data?.data) return <NoData />;

  const bookings: Booking[] = data.data.bookings || [];
  const paginationData = data.data.pagination;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background text-foreground py-4 px-6 relative">
      {/* HEADER */}
      <header className="flex flex-col gap-6 pt-6 pb-2 shrink-0">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex flex-col max-w-2xl gap-1.5">
            <h1 className="text-[28px] font-bold text-slate-900 dark:text-white tracking-tight">
              Booking Management
            </h1>
            <p className="text-slate-500 dark:text-text-muted-dark text-sm leading-relaxed">
              View and manage all bookings in the system through an
              editorial-grade interface designed for high-level orchestration.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="bg-[#f8f9fc] dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50 rounded-2xl p-4 flex items-center justify-between min-w-[200px] shadow-sm">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-500 dark:text-text-muted-dark uppercase tracking-widest">
                  Total Bookings
                </span>
                <span className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
                  {paginationData?.totalItems?.toLocaleString() ?? "0"}
                </span>
              </div>
              <div className="h-10 w-10 bg-[#1a2332] rounded-xl flex items-center justify-center text-white shadow-md ml-4">
                <FaCalendarAlt size={18} />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* FILTERS & LIFECYCLE PILLS */}
      <div className="flex flex-col gap-4 pb-4">
        {/* Quick Lifecycle Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {[
            { label: "All Bookings", value: "" },
            { label: "Store Assigned", value: "store_assigned" },
            { label: "Driver Assigned", value: "driver_assigned" },
            { label: "Picked Up", value: "picked_up" },
            { label: "Stored in Vault", value: "stored" },
            { label: "Return Requested", value: "return_requested" },
            { label: "Out for Delivery", value: "out_for_return" },
            { label: "Delivered", value: "delivered" },
            { label: "Cancelled", value: "cancelled" },
          ].map((pill) => (
            <button
              key={pill.value}
              onClick={() => handleStatusChange(pill.value)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === pill.value
                  ? "bg-primary text-white shadow-sm"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 border border-slate-200 dark:border-slate-700/50"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between">
          {/* SEARCH */}
          <div className="w-full xl:max-w-md">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <BiSearch
                  className="text-slate-400 group-focus-within:text-primary transition-colors"
                  size={20}
                />
              </div>

              <input
                className="block w-full h-11 pl-10 pr-9 bg-white dark:bg-[#111722]
                           border border-slate-200 dark:border-[#232f48]
                           rounded-lg text-slate-900 dark:text-white
                           placeholder-slate-400 dark:placeholder-slate-500
                           focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
                           transition-all text-sm"
                placeholder="Search by booking code, user name, phone..."
                type="text"
                value={searchInput}
                onChange={handleSearchChange}
              />

              {searchInput && (
                <button
                  onClick={handleClearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  aria-label="Clear search"
                >
                  <BiX
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                    size={18}
                  />
                </button>
              )}
            </div>
          </div>

          {/* GRANULAR STATUS DROPDOWN FILTER */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative group">
              <button
                className="flex items-center gap-2 h-10 px-3.5 bg-white dark:bg-[#111722]
                           hover:bg-slate-50 dark:hover:bg-[#232f48]
                           border border-slate-200 dark:border-[#232f48]
                           rounded-lg transition-colors"
              >
                <span className="text-slate-700 dark:text-slate-300 text-sm font-medium">
                  Status:{" "}
                  <span className="text-slate-900 dark:text-white font-bold">
                    {STATUS_OPTIONS.find((opt) => opt.value === statusFilter)?.label || "All Status"}
                  </span>
                </span>
                <BiFilter className="text-slate-400" size={18} />
              </button>

              <div
                className="absolute top-full right-0 mt-1 w-64 bg-white dark:bg-[#111722]
                              border border-slate-200 dark:border-[#232f48]
                              rounded-xl shadow-lg opacity-0 invisible
                              group-hover:opacity-100 group-hover:visible
                              transition-all z-20 overflow-hidden max-h-80 overflow-y-auto"
              >
                {STATUS_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleStatusChange(option.value)}
                    className={`w-full text-left px-4 py-2.5 text-xs font-semibold
                      hover:bg-slate-50 dark:hover:bg-[#232f48]
                      transition-colors flex items-center gap-2
                      ${
                        statusFilter === option.value
                          ? "text-primary bg-primary/10"
                          : "text-slate-700 dark:text-slate-300"
                      }`}
                  >
                    <span className={`text-base ${option.color}`}>
                      {option.icon}
                    </span>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {isLoading ? (
          <div className="p-4">
            <TableSkeleton rows={8} cols={8} />
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-slate-400">
              <p className="text-sm font-medium">No bookings found for the current filters.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl shadow-sm overflow-hidden">
            <div className="flex-1 overflow-x-auto">
              <table className="w-full border-collapse text-sm text-text-main-light dark:text-text-main-dark min-w-[900px]">
                <thead className="sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm border-b border-border-light dark:border-border-dark">
                  <tr>
                    <th className="px-4 py-3.5 text-left font-semibold tracking-wider uppercase text-[11px] text-text-muted-light dark:text-text-muted-dark">
                      Booking Code
                    </th>
                    <th className="px-4 py-3.5 text-left font-semibold tracking-wider uppercase text-[11px] text-text-muted-light dark:text-text-muted-dark">
                      Customer
                    </th>
                    <th className="px-4 py-3.5 text-left font-semibold tracking-wider uppercase text-[11px] text-text-muted-light dark:text-text-muted-dark hidden lg:table-cell">
                      Store
                    </th>
                    <th className="px-4 py-3.5 text-left font-semibold tracking-wider uppercase text-[11px] text-text-muted-light dark:text-text-muted-dark hidden xl:table-cell">
                      Assigned Driver
                    </th>
                    <th className="px-4 py-3.5 text-left font-semibold tracking-wider uppercase text-[11px] text-text-muted-light dark:text-text-muted-dark">
                      Amount & Payment
                    </th>
                    <th className="px-4 py-3.5 text-left font-semibold tracking-wider uppercase text-[11px] text-text-muted-light dark:text-text-muted-dark">
                      Status
                    </th>
                    <th className="px-4 py-3.5 text-left font-semibold tracking-wider uppercase text-[11px] text-text-muted-light dark:text-text-muted-dark hidden md:table-cell">
                      Luggage
                    </th>
                    <th className="px-4 py-3.5 text-left font-semibold tracking-wider uppercase text-[11px] text-text-muted-light dark:text-text-muted-dark hidden md:table-cell">
                      Created At
                    </th>
                    <th className="px-4 py-3.5 text-right font-semibold tracking-wider uppercase text-[11px] text-text-muted-light dark:text-text-muted-dark">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light dark:divide-border-dark">
                  {bookings.map((booking: any) => {
                    const driverInfo = getAssignedDriver(booking);
                    const amountInfo = getBookingAmount(booking);
                    return (
                      <tr
                        key={booking._id}
                        className="group transition-all duration-200 hover:bg-background-light dark:hover:bg-background-dark/50 bg-surface-light dark:bg-surface-dark cursor-pointer"
                        onClick={() => router.push(`/bookings/${booking._id}`)}
                      >
                        {/* BOOKING CODE */}
                        <td className="px-4 py-3.5">
                          <span className="font-bold text-primary font-mono text-xs hover:underline">
                            {booking.bookingCode || "—"}
                          </span>
                        </td>

                        {/* CUSTOMER */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div
                              className="h-9 w-9 flex-shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shadow-sm ring-1 ring-primary/20"
                            >
                              {getUserInitial(booking.userId)}
                            </div>
                            <div className="leading-tight min-w-0">
                              <p className="font-bold text-text-main-light dark:text-text-main-dark text-xs truncate">
                                {getUserName(booking.userId)}
                              </p>
                              <p className="text-[11px] text-text-muted-light dark:text-text-muted-dark mt-0.5 truncate">
                                {getUserPhone(booking.userId) || getUserEmail(booking.userId)}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* STORE */}
                        <td className="px-4 py-3.5 hidden lg:table-cell">
                          <span className="text-xs font-medium text-text-main-light dark:text-text-main-dark">
                            {getStoreName(booking.storeId)}
                          </span>
                        </td>

                        {/* DRIVER */}
                        <td className="px-4 py-3.5 hidden xl:table-cell">
                          {driverInfo.isAssigned ? (
                            <div className="flex flex-col">
                              <span className="text-xs font-semibold text-text-main-light dark:text-text-main-dark">
                                {driverInfo.name}
                              </span>
                              <span className="text-[10px] text-text-muted-light dark:text-text-muted-dark">
                                {driverInfo.type} • {driverInfo.phone || "No phone"}
                              </span>
                            </div>
                          ) : (
                            <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500">
                              Unassigned
                            </span>
                          )}
                        </td>

                        {/* AMOUNT & PAYMENT */}
                        <td className="px-4 py-3.5">
                          <div className="flex flex-col items-start gap-0.5">
                            <span className="text-xs font-black text-slate-900 dark:text-white">
                              {amountInfo.currencySymbol}
                              {amountInfo.total > 0 ? amountInfo.total.toFixed(2) : "0.00"}
                            </span>
                            <span className={`px-1.5 py-0.2 text-[9px] font-extrabold uppercase rounded ${
                              amountInfo.payStatus === "paid" || amountInfo.payStatus === "captured"
                                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                                : amountInfo.payStatus === "failed"
                                ? "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"
                                : "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                            }`}>
                              {amountInfo.payStatus}
                            </span>
                          </div>
                        </td>

                        {/* STATUS */}
                        <td className="px-4 py-3.5">
                          <div className="inline-block">
                            {getBookingStatusBadge(booking.status)}
                          </div>
                        </td>

                        {/* LUGGAGE */}
                        <td className="px-4 py-3.5 hidden md:table-cell">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
                            {booking.luggage?.totalCount ?? 0} bags
                          </span>
                        </td>

                        {/* TIME */}
                        <td className="px-4 py-3.5 hidden md:table-cell">
                          <span className="text-text-muted-light dark:text-text-muted-dark text-xs">
                            {formatDate(booking.createdAt)}
                          </span>
                        </td>

                        {/* ACTIONS */}
                        <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => router.push(`/bookings/${booking._id}`)}
                              title="View Details"
                              className="p-2 rounded-lg text-text-muted-light dark:text-text-muted-dark hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                            >
                              <FaEye size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            {(paginationData?.totalPages ?? 1) > 1 && (
              <div className="border-t border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-4">
                <Pagination
                  currentPage={paginationData?.currentPage ?? pagination.page}
                  totalPages={paginationData?.totalPages ?? 1}
                  onPageChange={(page) => setPagination((p) => ({ ...p, page }))}
                  siblingCount={1}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
