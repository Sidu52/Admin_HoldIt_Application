"use client";

import { FaEye } from "react-icons/fa";
import { useAppSelector } from "@/app/store/hooks";
import { Booking } from "@/app/types/booking";
import NoData from "@/app/NoData";

const ActivityTable = () => {
  const { bookings, pagination } = useAppSelector((state) => state.booking);

  if (bookings && bookings.length==0){
  return <NoData/>
} 

  const getStatusStyles = (status: Booking["status"]) => {
    const styles = {
      completed: {
        bg: "bg-emerald-100 dark:bg-emerald-500/10",
        text: "text-emerald-800 dark:text-emerald-400",
        border: "border-emerald-200 dark:border-emerald-500/20",
      },
      "in-progress": {
        bg: "bg-blue-100 dark:bg-blue-500/10",
        text: "text-blue-800 dark:text-blue-400",
        border: "border-blue-200 dark:border-blue-500/20",
      },
      pending: {
        bg: "bg-amber-100 dark:bg-amber-500/10",
        text: "text-amber-800 dark:text-amber-400",
        border: "border-amber-200 dark:border-amber-500/20",
      },
      cancelled: {
        bg: "bg-slate-100 dark:bg-slate-700",
        text: "text-slate-800 dark:text-slate-400",
        border: "border-slate-200 dark:border-slate-600",
      },
    };

    return styles[status];
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ");
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
              const statusStyles = getStatusStyles(activity.status);

              return (
                <tr
                  key={activity.id}
                  className="hover:bg-slate-50 dark:hover:bg-[#252f44] transition-colors group"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {activity.bookingId}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 bg-cover bg-center"
                        style={{
                          backgroundImage: `url('${activity.userAvatar}')`,
                        }}
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          {activity.userName}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {activity.userEmail}
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
                      {activity.bookingTime}
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
