"use client";
import { useMemo, useState, useEffect } from "react";
import StatCard from "@/app/components/dashboard/StatCard";
import ActivityTable from "@/app/components/dashboard/ActivityTable";
import ChartBar from "@/app/components/dashboard/ChartBar";


import {
  CardSkeleton,
  ChartSkeleton,
  ActiveTableSkeleton,
} from "@/app/loading/dashboard";

import { FaClipboardList, FaStore, FaTruck, FaUsers } from "react-icons/fa";
import { StatsCard } from "@/app/types/dashboard";
import { useGetSummaryQuery, useGetChartQuery } from "../../../services/dashboardApi";
import { useGetProfileQuery } from "../../../services/adminApi";
import { useGetBookingsQuery } from "../../../services/bookingApi";
import { RoleGuard } from "../../../components/common/RoleGuard";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials } from "@/app/store/slices/authSlice";
import { RootState } from "@/app/store";
import { useSocket } from "@/app/hooks/useSocket";
import { api } from "../../../services/api";

const RANGE = [
  { label: "Today", value: "today" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "Last 3 Month", value: "last_3_months" },
];

const ENTITY = [
  { label: "User", value: "user" },
  { label: "Booking", value: "booking" },
];

export default function DashboardPage() {
  const [entity, setEntity] = useState("user");
  const [range, setRange] = useState("week");
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const {
    data: summaryData,
    isLoading: summaryLoading,
    isError: summaryError,
  } = useGetSummaryQuery();

  const {
    data: chartData,
    isLoading: chartLoading,
    isError: chartError,
  } = useGetChartQuery({ type: entity, groupBy: range });

  const { data: bookingData, isLoading: bookingLoading } = useGetBookingsQuery({ page: 1, limit: 10 });

  const isPageLoading = summaryLoading && !summaryData;
  const isPageError = summaryError || chartError;

  const cards = useMemo(() => {
    if (!summaryData?.data) return [];
    return buildStatsCards(summaryData.data);
  }, [summaryData]);

  // Realtime Stats Update
  useSocket("admin:stats:update", () => {
    dispatch(api.util.invalidateTags(["Dashboard"]));
  });

  // Realtime Booking Status Update
  useSocket("admin:booking:status_changed", () => {
    dispatch(api.util.invalidateTags(["Booking"]));
  });

  /* 🔹 Global loading */
  if (isPageLoading) {
    return (
      <div className="w-full max-w-[1600px] mx-auto p-6 flex flex-col gap-8">
        <CardSkeleton />
        <ChartSkeleton />
        <ActiveTableSkeleton />
      </div>
    );
  }

  /* 🔹 Global error */
  if (isPageError) {
    return (
      <div className="p-6 text-red-500 font-medium">
        Failed to load dashboard data
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={["SUPER_ADMIN", "ADMIN", "OPERATION_MANAGER"]} fallback={<div className="p-8 text-center font-bold uppercase tracking-widest text-text-muted-light">Access Denied</div>}>
    <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark">
      <div className="w-full max-w-[1600px] mx-auto p-8 flex flex-col gap-10">
        {/* Header */}
        <div className="flex justify-between items-end">
          <div className="flex flex-col gap-1">
            <h1 className="text-4xl font-extrabold font-display tracking-tight text-text-main-light dark:text-text-main-dark">Dashboard</h1>
            <p className="text-text-muted-light dark:text-text-muted-dark font-medium tracking-wide">
              System performance and operational overview.
            </p>
          </div>

          <div className="hidden sm:block">

          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, index) => (
            <StatCard key={index} {...card} />
          ))}
        </div>

        {/* Analytics Section */}
        <div className="card-premium p-8 bg-surface-light dark:bg-surface-dark border-none shadow-premium/5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="flex flex-col gap-1">
              <h3 className="text-xl font-bold font-display text-text-main-light dark:text-text-main-dark">Analytics</h3>
              <p className="text-xs font-bold text-text-muted-light uppercase tracking-widest">Growth & Trends</p>
            </div>

            <div className="flex items-center gap-3">
              <select 
                value={range} 
                onChange={(e) => setRange(e.target.value)}
                className="bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl px-4 py-2 text-sm font-bold text-text-main-light dark:text-text-main-dark focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              >
                {RANGE.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>

              <select
                value={entity}
                onChange={(e) => setEntity(e.target.value)}
                className="bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl px-4 py-2 text-sm font-bold text-text-main-light dark:text-text-main-dark focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              >
                {ENTITY.map((e) => (
                  <option key={e.value} value={e.value}>
                    {e.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="h-[400px] w-full">
            {chartData &&
              (chartLoading ? <ChartSkeleton /> : <ChartBar data={chartData?.data} />)}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="flex flex-col gap-6">
           <div className="flex flex-col gap-1">
              <h3 className="text-xl font-bold font-display text-text-main-light dark:text-text-main-dark">Recent Activity</h3>
              <p className="text-xs font-bold text-text-muted-light uppercase tracking-widest">Latest Bookings</p>
            </div>
          {bookingData &&
            (bookingLoading ? (
              <ActiveTableSkeleton />
            ) : (
              <ActivityTable data={bookingData} />
            ))}
        </div>
      </div>
    </main>
    </RoleGuard>
  );
}
// Stats Card Builder
const buildStatsCards = (stats: any): StatsCard[] => {
  return [
    {
      title: "Bookings Today",
      value: stats.bookings.totalToday,
      icon: <FaClipboardList />,
      iconBgColor: "bg-blue-100 dark:bg-blue-500/10",
      iconColor: "text-blue-600 dark:text-blue-400",
      stats: [
        {
          label: "In Progress",
          value: stats.bookings.inProgress,
          bgColor: "bg-blue-100 dark:bg-blue-500/10",
          textColor: "text-blue-600 dark:text-blue-400",
        },
        {
          label: "Completed",
          value: stats.bookings.completed,
          bgColor: "bg-green-100 dark:bg-green-500/10",
          textColor: "text-green-600 dark:text-green-400",
        },
      ],
    },

    // Users Card
    {
      title: "Users",
      value: stats.users.total,
      icon: <FaUsers />,
      iconBgColor: "bg-indigo-100 dark:bg-indigo-500/10",
      iconColor: "text-indigo-600 dark:text-indigo-400",
      stats: [
        {
          label: "New Today",
          value: stats.users.newToday,
          bgColor: "bg-emerald-100 dark:bg-emerald-500/10",
          textColor: "text-emerald-500 dark:text-emerald-400",
        },
      ],
    },

    // Drivers Card
    {
      title: "Drivers",
      value: stats.drivers.total,
      icon: <FaTruck />,
      iconBgColor: "bg-emerald-100 dark:bg-emerald-500/10",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      stats: [
        {
          label: "Online",
          value: stats.drivers.online,
          bgColor: "bg-emerald-100 dark:bg-emerald-500/10",
          textColor: "text-emerald-500 dark:text-emerald-400",
        },
        {
          label: "Offline",
          value: stats.drivers.offline,
          bgColor: "bg-rose-100 dark:bg-rose-500/10",
          textColor: "text-rose-600 dark:text-rose-400",
        },
      ],
    },

    // Stores Card
    {
      title: "Stores",
      value: stats.stores.total,
      icon: <FaStore />,
      iconBgColor: "bg-pink-100 dark:bg-pink-500/10",
      iconColor: "text-pink-600 dark:text-pink-400",
      stats: [
        {
          label: "Online",
          value: stats.stores.online,
          bgColor: "bg-emerald-100 dark:bg-emerald-500/10",
          textColor: "text-emerald-500 dark:text-emerald-400",
        },
        {
          label: "Offline",
          value: stats.stores.offline,
          bgColor: "bg-rose-100 dark:bg-rose-500/10",
          textColor: "text-rose-600 dark:text-rose-400",
        },
      ],
    },
  ];
};
