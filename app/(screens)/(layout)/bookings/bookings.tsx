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
  BiLock,
} from "react-icons/bi";
import NoData from "@/app/NoData";
import { useGetBookingsQuery } from "../../../services/bookingApi";
import { Booking } from "@/app/types/booking";
import Pagination from "@/app/components/common/Pagination";
import { debounce } from "@/app/utils/helper";

const STATUS_OPTIONS = [
  { label: "All Status", value: "", icon: <BiUser />, color: "text-slate-400" },
  { label: "Pending", value: "pending", icon: <BiTime />, color: "text-amber-500" },
  { label: "In Progress", value: "in-progress", icon: <BiCheckCircle />, color: "text-blue-500" },
  { label: "Completed", value: "completed", icon: <BiCheckCircle />, color: "text-green-500" },
  { label: "Cancelled", value: "cancelled", icon: <BiBlock />, color: "text-red-500" },
] as const;

const getBookingStatusBadge = (status: string) => {
  const base = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold";
  switch (status.toLowerCase()) {
    case "completed":
      return (
        <span className={`${base} bg-emerald-50 text-emerald-600`}>
          <span className="size-1.5 rounded-full bg-emerald-500" /> Completed
        </span>
      );
    case "pending":
      return (
        <span className={`${base} bg-amber-50 text-amber-600`}>
          <span className="size-1.5 rounded-full bg-amber-500" /> Pending
        </span>
      );
    case "in-progress":
      return (
        <span className={`${base} bg-blue-50 text-blue-600`}>
          <span className="size-1.5 rounded-full bg-blue-500" /> In Progress
        </span>
      );
    case "cancelled":
      return (
        <span className={`${base} bg-red-50 text-red-600`}>
          <span className="size-1.5 rounded-full bg-red-500" /> Cancelled
        </span>
      );
    default:
      return (
        <span className={`${base} bg-slate-50 text-slate-600`}>
          {status}
        </span>
      );
  }
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
            <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">
              Booking Management
            </h1>
            <p className="text-slate-500 text-sm leading-relaxed">
              View and manage all bookings in the system through an
              editorial-grade interface designed for high-level orchestration.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="bg-[#f8f9fc] border border-slate-200/60 rounded-2xl p-4 flex items-center justify-between min-w-[200px] shadow-sm">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Total Bookings
                </span>
                <span className="text-2xl font-bold text-slate-900 mt-0.5">
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
                placeholder="Search by booking ID, user name..."
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
                className="absolute top-full left-0 mt-1 w-52 bg-white dark:bg-[#111722]
                              border border-slate-200 dark:border-[#232f48]
                              rounded-xl shadow-lg opacity-0 invisible
                              group-hover:opacity-100 group-hover:visible
                              transition-all z-20 overflow-hidden"
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
          <div className="flex flex-col h-full bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex-1 overflow-auto">
              <table className="w-full border-collapse text-sm text-slate-800">
                <thead className="sticky top-0 z-10 bg-slate-50/80 backdrop-blur-sm border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-4 text-left font-semibold tracking-wider uppercase text-[11px] text-slate-500">
                      Booking ID
                    </th>
                    <th className="px-4 py-4 text-left font-semibold tracking-wider uppercase text-[11px] text-slate-500">
                      User
                    </th>
                    <th className="px-4 py-4 text-left font-semibold tracking-wider uppercase text-[11px] text-slate-500">
                      Status
                    </th>
                    <th className="px-4 py-4 text-left font-semibold tracking-wider uppercase text-[11px] text-slate-500 hidden md:table-cell">
                      Booking Time
                    </th>
                    <th className="px-4 py-4 text-right font-semibold tracking-wider uppercase text-[11px] text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80">
                  {bookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="group transition-all duration-200 hover:bg-slate-50/80 bg-white"
                    >
                      {/* BOOKING ID */}
                      <td className="px-4 py-4">
                        <span className="font-semibold text-slate-800">
                          {booking.bookingId}
                        </span>
                      </td>

                      {/* USER */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-4">
                          <div
                            className="h-10 w-10 flex-shrink-0 rounded-lg bg-[#1a2332] bg-cover bg-center flex items-center justify-center font-bold text-white text-sm shadow-sm"
                            style={booking.userAvatar ? { backgroundImage: `url(${booking.userAvatar})` } : {}}
                          >
                            {!booking.userAvatar && booking.userName?.charAt(0).toUpperCase()}
                          </div>
                          <div className="leading-tight">
                            <p className="font-semibold text-slate-800 cursor-default">
                              {booking.userName}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {booking.userEmail}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* STATUS */}
                      <td className="px-4 py-4">
                        <div className="inline-block">
                          {getBookingStatusBadge(booking.status)}
                        </div>
                      </td>

                      {/* TIME */}
                      <td className="px-4 py-4 hidden md:table-cell">
                        <span className="text-slate-600 text-[13px]">
                          {booking.bookingTime}
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td className="px-4 py-4 text-right">
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => router.push(`/booking/${booking.id}`)}
                            title="View Details"
                            className="text-slate-400 hover:text-blue-600 cursor-pointer transition-colors p-1"
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
              <div className="border-t border-slate-100 bg-white p-4">
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
