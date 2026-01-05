"use client";
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import {
  fetchDashboardSummary,
  fetchDashboardChart,
} from "@/app/store/thunks/dashboardThunks";
import { fetchBookings } from "@/app/store/thunks/bookingThunks";
import StatCard from "@/app/components/dashboard/StatCard";
import ActivityTable from "@/app/components/dashboard/ActivityTable";
import ChartBar from "@/app/components/dashboard/ChartBar";
import ProfileDropdown from "@/app/components/dashboard/ProfileDropdown";

import {
  CardSkeleton,
  ChartSkeleton,
  ActiveTableSkeleton,
} from "@/app/loading/dashboard";

import { FaClipboardList, FaStore, FaTruck, FaUsers } from "react-icons/fa";
import { Stats, StatsCard } from "@/app/types/dashboard";
import { fetchProfileThunk } from "@/app/store/thunks/profileThunks";

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
  const dispatch = useAppDispatch();
  const [entity, setEntity] = useState("user");
  const [range, setRange] = useState("week");
  const { loading } = useAppSelector((state) => state.profile);
  const { summary, summaryLoading, chartLoading, error } = useAppSelector(
    (state) => state.dashboard
  );
  const { bookingLoading } = useAppSelector((state) => state.booking);

  useEffect(() => {
    dispatch(fetchDashboardSummary());
    dispatch(fetchBookings());
    dispatch(fetchProfileThunk());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchDashboardChart({ entity, range }));
  }, [dispatch, entity, range]);

  /* Memoized Cards */
  const cards = useMemo(() => buildStatsCards(summary as Stats), [summary]);

  if (loading) {
    return (
      <div className="w-full max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-8">
        <CardSkeleton />
        <ChartSkeleton />
        <ActiveTableSkeleton />
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="p-6 text-red-500 font-medium">
        Failed to load dashboard data
      </div>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="w-full max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">
              Dashboard Overview
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Here is an overview of your managed system performance.
            </p>
          </div>
          <ProfileDropdown />
        </div>

        {/* Stats */}
        {summaryLoading ? (
          <CardSkeleton />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card, index) => (
              <StatCard key={index} {...card} />
            ))}
          </div>
        )}

        {/* Chart */}
        <div className="rounded-xl border bg-white dark:bg-[#1e293b] p-6">
          <div className="flex justify-between mb-6">
            <h3 className="text-lg font-bold">Booking Analytics</h3>
            <div className="flex gap-2">
              <select
                value={range}
                onChange={(e) => setRange(e.target.value)}
                className="select"
              >
                {RANGE.map((r) => (
                  <option
                    key={r.value}
                    value={r.value}
                    className="text-[14px] font-normal text-[#333]"
                  >
                    {r.label}
                  </option>
                ))}
              </select>

              <select
                value={entity}
                onChange={(e) => setEntity(e.target.value)}
                className="select"
              >
                {ENTITY.map((e) => (
                  <option
                    key={e.value}
                    value={e.value}
                    className="text-[14px] font-normal text-[#333]"
                  >
                    {e.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {chartLoading ? <ChartSkeleton /> : <ChartBar />}
        </div>

        {/* Activity */}
        {bookingLoading ? <ActiveTableSkeleton /> : <ActivityTable />}
      </div>
    </main>
  );
}

// Stats Card Builder
const buildStatsCards = (stats: Stats): StatsCard[] => {
  console.log("starts", stats);
  if (!stats) return [];

  return [
    {
      title: "Bookings Today",
      value: stats.booking.totalToday,
      icon: <FaClipboardList />,
      iconBgColor: "bg-blue-100 dark:bg-blue-500/10",
      iconColor: "text-blue-600 dark:text-blue-400",
      stats: [
        {
          label: "In Progress",
          value: stats.booking.inProgress,
          bgColor: "bg-blue-100 dark:bg-blue-500/10",
          textColor: "text-blue-600 dark:text-blue-400",
        },
        {
          label: "Completed",
          value: stats.booking.completed,
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
