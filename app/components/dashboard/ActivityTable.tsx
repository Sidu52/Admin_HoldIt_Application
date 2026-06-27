"use client";

import { FaEye } from "react-icons/fa";
import { Booking } from "@/app/types/booking";
import NoData from "@/app/NoData";
import { Pagination } from "@/app/types/user";

type Props = {
  bookings: any[];
  pagination: Pagination;
};

const ActivityTable = ({ data }: { data: { data: Props } }) => {
  const { bookings, pagination } = data.data;
  if (bookings && bookings.length == 0) {
    return <NoData />
  }

  const STATUS_STYLES: Record<string, { bg: string; text: string; border: string }> = {
    created:                  { bg: "bg-slate-100 dark:bg-slate-500/10",   text: "text-slate-800 dark:text-slate-400",   border: "border-slate-200 dark:border-slate-500/20" },
    store_assigned:           { bg: "bg-indigo-100 dark:bg-indigo-500/10", text: "text-indigo-800 dark:text-indigo-400", border: "border-indigo-200 dark:border-indigo-500/20" },
    driver_assigned:          { bg: "bg-blue-100 dark:bg-blue-500/10",     text: "text-blue-800 dark:text-blue-400",     border: "border-blue-200 dark:border-blue-500/20" },
    driver_arrived:           { bg: "bg-cyan-100 dark:bg-cyan-500/10",     text: "text-cyan-800 dark:text-cyan-400",     border: "border-cyan-200 dark:border-cyan-500/20" },
    picked_up:                { bg: "bg-teal-100 dark:bg-teal-500/10",     text: "text-teal-800 dark:text-teal-400",     border: "border-teal-200 dark:border-teal-500/20" },
    at_store:                 { bg: "bg-purple-100 dark:bg-purple-500/10", text: "text-purple-800 dark:text-purple-400", border: "border-purple-200 dark:border-purple-500/20" },
    stored:                   { bg: "bg-violet-100 dark:bg-violet-500/10", text: "text-violet-800 dark:text-violet-400", border: "border-violet-200 dark:border-violet-500/20" },
    return_requested:         { bg: "bg-amber-100 dark:bg-amber-500/10",   text: "text-amber-800 dark:text-amber-400",   border: "border-amber-200 dark:border-amber-500/20" },
    return_driver_assigned:   { bg: "bg-orange-100 dark:bg-orange-500/10", text: "text-orange-800 dark:text-orange-400", border: "border-orange-200 dark:border-orange-500/20" },
    out_for_return:           { bg: "bg-sky-100 dark:bg-sky-500/10",       text: "text-sky-800 dark:text-sky-400",       border: "border-sky-200 dark:border-sky-500/20" },
    arrived_for_delivery:     { bg: "bg-lime-100 dark:bg-lime-500/10",     text: "text-lime-800 dark:text-lime-400",     border: "border-lime-200 dark:border-lime-500/20" },
    delivered:                { bg: "bg-emerald-100 dark:bg-emerald-500/10", text: "text-emerald-800 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-500/20" },
    cancelled:                { bg: "bg-red-100 dark:bg-red-500/10",       text: "text-red-800 dark:text-red-400",       border: "border-red-200 dark:border-red-500/20" },
    driver_cancelled_critical:{ bg: "bg-rose-100 dark:bg-rose-500/10",     text: "text-rose-800 dark:text-rose-400",     border: "border-rose-200 dark:border-rose-500/20" },
  };

  const DEFAULT_STYLE = { bg: "bg-blue-100 dark:bg-blue-500/10", text: "text-blue-800 dark:text-blue-400", border: "border-blue-200 dark:border-blue-500/20" };

  const getStatusStyles = (status: string) => {
    return STATUS_STYLES[status] || DEFAULT_STYLE;
  };

  const formatStatus = (status: string) => {
    return status.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  };

  return (
    <div className="w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e293b] shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111722]/50">
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Booking ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                User Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Booking Time
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {bookings.map((activity) => {
              const statusStyles = getStatusStyles(activity.status) ?? {
                bg: "bg-blue-100 dark:bg-blue-500/10",
                text: "text-blue-800 dark:text-blue-400",
                border: "border-blue-200 dark:border-blue-500/20",
              };
              return (
                <tr
                  key={activity._id || activity.id}
                  className="hover:bg-slate-50 dark:hover:bg-[#252f44] transition-colors group"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {activity.bookingCode || activity.bookingId}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 bg-cover bg-center"
                        style={{
                          backgroundImage: `url('${activity.userAvatar || `https://ui-avatars.com/api/?name=${activity.userId?.first_name || 'U'}+${activity.userId?.last_name || ''}&background=random`}')`,
                        }}
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          {activity.userId ? `${activity.userId.first_name || ''} ${activity.userId.last_name || ''}`.trim() : activity.userName}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {activity.userId?.email || activity.userEmail}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-full ${statusStyles.bg} ${statusStyles.text} ${statusStyles.border} px-2.5 py-0.5 text-xs font-medium`}
                    >
                      {formatStatus(activity.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {activity.createdAt ? new Date(activity.createdAt).toLocaleString() : activity.bookingTime}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-slate-400 hover:text-[#135bec] dark:hover:text-[#135bec] transition-colors p-1">
                      <FaEye className="text-lg" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 px-6 py-4">
        <div className="text-sm text-slate-500 dark:text-slate-400">
          Showing{" "}
          <span className="font-medium text-slate-900 dark:text-white">
            {(pagination.currentPage - 1) * 5 + 1}
          </span>{" "}
          to{" "}
          <span className="font-medium text-slate-900 dark:text-white">
            {Math.min(pagination.currentPage * 5, pagination.totalItems)}
          </span>{" "}
          of{" "}
          <span className="font-medium text-slate-900 dark:text-white">
            {pagination.totalItems}
          </span>{" "}
          results
        </div>
        <div className="flex items-center gap-2">
          <button
            // onClick={() => onPageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <button
            // onClick={() => onPageChange(currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityTable;
