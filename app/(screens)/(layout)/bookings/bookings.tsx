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
import Pagination from "@/app/components/common/Pagination";
import { debounce } from "@/app/utils/helper";

// ── Helpers ──
const getUserName = (userId: Booking["userId"]): string => {
  if (typeof userId === "string") return userId;
  return `${userId?.first_name || ""} ${userId?.last_name || ""}`.trim() || "—";
};

const getUserEmail = (userId: Booking["userId"]): string => {
  if (typeof userId === "string") return "";
  return userId?.email || "";
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
  { label: "Store Assigned", value: "store_assigned", icon: <BiCheckCircle />, color: "text-indigo-500" },
  { label: "Driver Assigned", value: "driver_assigned", icon: <BiCheckCircle />, color: "text-blue-500" },
  { label: "Driver Arrived", value: "driver_arrived", icon: <BiCheckCircle />, color: "text-cyan-500" },
  { label: "Picked Up", value: "picked_up", icon: <BiCheckCircle />, color: "text-teal-500" },
  { label: "At Store", value: "at_store", icon: <BiCheckCircle />, color: "text-purple-500" },
  { label: "Stored", value: "stored", icon: <BiCheckCircle />, color: "text-violet-500" },
  { label: "Return Requested", value: "return_requested", icon: <BiTime />, color: "text-amber-500" },
  { label: "Return Driver Assigned", value: "return_driver_assigned", icon: <BiCheckCircle />, color: "text-orange-500" },
  { label: "Out for Return", value: "out_for_return", icon: <BiCheckCircle />, color: "text-sky-500" },
  { label: "Arrived for Delivery", value: "arrived_for_delivery", icon: <BiCheckCircle />, color: "text-lime-600" },
  { label: "Delivered", value: "delivered", icon: <BiCheckCircle />, color: "text-green-500" },
  { label: "Cancelled", value: "cancelled", icon: <BiBlock />, color: "text-red-500" },
] as const;

const STATUS_BADGE_MAP: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  created:                  { label: "Created",               dot: "bg-slate-400",   bg: "bg-slate-50 dark:bg-slate-500/10",    text: "text-slate-600 dark:text-slate-400" },
  store_assigned:           { label: "Store Assigned",        dot: "bg-indigo-500",  bg: "bg-indigo-50 dark:bg-indigo-500/10",  text: "text-indigo-600 dark:text-indigo-400" },
  driver_assigned:          { label: "Driver Assigned",       dot: "bg-blue-500",    bg: "bg-blue-50 dark:bg-blue-500/10",      text: "text-blue-600 dark:text-blue-400" },
  driver_arrived:           { label: "Driver Arrived",        dot: "bg-cyan-500",    bg: "bg-cyan-50 dark:bg-cyan-500/10",      text: "text-cyan-600 dark:text-cyan-400" },
  picked_up:                { label: "Picked Up",             dot: "bg-teal-500",    bg: "bg-teal-50 dark:bg-teal-500/10",      text: "text-teal-600 dark:text-teal-400" },
  at_store:                 { label: "At Store",              dot: "bg-purple-500",  bg: "bg-purple-50 dark:bg-purple-500/10",  text: "text-purple-600 dark:text-purple-400" },
  stored:                   { label: "Stored",                dot: "bg-violet-500",  bg: "bg-violet-50 dark:bg-violet-500/10",  text: "text-violet-600 dark:text-violet-400" },
  return_requested:         { label: "Return Requested",      dot: "bg-amber-500",   bg: "bg-amber-50 dark:bg-amber-500/10",    text: "text-amber-600 dark:text-amber-400" },
  return_driver_assigned:   { label: "Return Driver Assigned",dot: "bg-orange-500",  bg: "bg-orange-50 dark:bg-orange-500/10",  text: "text-orange-600 dark:text-orange-400" },
  out_for_return:           { label: "Out for Return",        dot: "bg-sky-500",     bg: "bg-sky-50 dark:bg-sky-500/10",        text: "text-sky-600 dark:text-sky-400" },
  arrived_for_delivery:     { label: "Arrived for Delivery",  dot: "bg-lime-500",    bg: "bg-lime-50 dark:bg-lime-500/10",      text: "text-lime-700 dark:text-lime-400" },
  delivered:                { label: "Delivered",             dot: "bg-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10",text: "text-emerald-600 dark:text-emerald-400" },
  cancelled:                { label: "Cancelled",             dot: "bg-red-500",     bg: "bg-red-50 dark:bg-red-500/10",        text: "text-red-600 dark:text-red-400" },
  driver_cancelled_critical:{ label: "Driver Cancelled",      dot: "bg-rose-600",    bg: "bg-rose-50 dark:bg-rose-500/10",      text: "text-rose-600 dark:text-rose-400" },
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

      {/* FILTERS */}
      <div className="flex flex-col gap-4 pb-4">
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

          {/* STATUS FILTER */}
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
                  <span className="text-slate-900 dark:text-white">
                    {STATUS_OPTIONS.find((opt) => opt.value === statusFilter)?.label || "All Status"}
                  </span>
                </span>
                <BiFilter className="text-slate-400" size={18} />
              </button>

              <div
                className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-[#111722]
                              border border-slate-200 dark:border-[#232f48]
                              rounded-xl shadow-lg opacity-0 invisible
                              group-hover:opacity-100 group-hover:visible
                              transition-all z-20 overflow-hidden max-h-80 overflow-y-auto"
              >
                {STATUS_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleStatusChange(option.value)}
                    className={`w-full text-left px-4 py-2.5 text-sm
                      hover:bg-slate-50 dark:hover:bg-[#232f48]
                      transition-colors flex items-center gap-2
                      ${
                        statusFilter === option.value
                          ? "text-primary bg-primary/10"
                          : "text-slate-700 dark:text-slate-300"
                      }`}
                  >
                    <span className={`text-lg ${option.color}`}>
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
      <div className={`flex-1 flex flex-col overflow-hidden transition-opacity duration-200 ${isFetching ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
        {bookings.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-slate-400">
              <p className="text-sm">No bookings found for the current filters.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl shadow-sm overflow-hidden">
            <div className="flex-1 overflow-auto">
              <table className="w-full border-collapse text-sm text-text-main-light dark:text-text-main-dark">
                <thead className="sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm border-b border-border-light dark:border-border-dark">
                  <tr>
                    <th className="px-4 py-4 text-left font-semibold tracking-wider uppercase text-[11px] text-text-muted-light dark:text-text-muted-dark">
                      Booking Code
                    </th>
                    <th className="px-4 py-4 text-left font-semibold tracking-wider uppercase text-[11px] text-text-muted-light dark:text-text-muted-dark">
                      Customer
                    </th>
                    <th className="px-4 py-4 text-left font-semibold tracking-wider uppercase text-[11px] text-text-muted-light dark:text-text-muted-dark hidden lg:table-cell">
                      Store
                    </th>
                    <th className="px-4 py-4 text-left font-semibold tracking-wider uppercase text-[11px] text-text-muted-light dark:text-text-muted-dark">
                      Status
                    </th>
                    <th className="px-4 py-4 text-left font-semibold tracking-wider uppercase text-[11px] text-text-muted-light dark:text-text-muted-dark hidden md:table-cell">
                      Luggage
                    </th>
                    <th className="px-4 py-4 text-left font-semibold tracking-wider uppercase text-[11px] text-text-muted-light dark:text-text-muted-dark hidden md:table-cell">
                      Created At
                    </th>
                    <th className="px-4 py-4 text-right font-semibold tracking-wider uppercase text-[11px] text-text-muted-light dark:text-text-muted-dark">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light dark:divide-border-dark">
                  {bookings.map((booking) => (
                    <tr
                      key={booking._id}
                      className="group transition-all duration-200 hover:bg-background-light dark:hover:bg-background-dark/50 bg-surface-light dark:bg-surface-dark"
                    >
                      {/* BOOKING CODE */}
                      <td className="px-4 py-4">
                        <span className="font-semibold text-text-main-light dark:text-text-main-dark font-mono text-xs">
                          {booking.bookingCode || "—"}
                        </span>
                      </td>

                      {/* CUSTOMER */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="h-9 w-9 flex-shrink-0 rounded-lg bg-[#1a2332] flex items-center justify-center font-bold text-white text-sm shadow-sm"
                          >
                            {getUserInitial(booking.userId)}
                          </div>
                          <div className="leading-tight min-w-0">
                            <p className="font-semibold text-text-main-light dark:text-text-main-dark truncate">
                              {getUserName(booking.userId)}
                            </p>
                            <p className="text-[11px] text-text-muted-light dark:text-text-muted-dark mt-0.5 truncate">
                              {getUserEmail(booking.userId)}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* STORE */}
                      <td className="px-4 py-4 hidden lg:table-cell">
                        <span className="text-sm text-text-muted-light dark:text-text-muted-dark">
                          {getStoreName(booking.storeId)}
                        </span>
                      </td>

                      {/* STATUS */}
                      <td className="px-4 py-4">
                        <div className="inline-block">
                          {getBookingStatusBadge(booking.status)}
                        </div>
                      </td>

                      {/* LUGGAGE */}
                      <td className="px-4 py-4 hidden md:table-cell">
                        <span className="text-sm font-medium text-text-main-light dark:text-text-main-dark">
                          {booking.luggage?.totalCount ?? "—"}
                        </span>
                        <span className="text-xs text-text-muted-light dark:text-text-muted-dark ml-1">
                          items
                        </span>
                      </td>

                      {/* TIME */}
                      <td className="px-4 py-4 hidden md:table-cell">
                        <span className="text-text-muted-light dark:text-text-muted-dark text-[13px]">
                          {formatDate(booking.createdAt)}
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td className="px-4 py-4 text-right">
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => router.push(`/bookings/${booking._id}`)}
                            title="View Details"
                            className="text-text-muted-light dark:text-text-muted-dark hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors p-1"
                          >
                            <FaEye size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
