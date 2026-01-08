"use client";
import { useMemo, useState } from "react";
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
import { StatsCard } from "@/app/types/dashboard";
import { useSummaryQuery, useChartQuery } from "@/app/react_queries/dashboard";
import { useProfileQuery } from "@/app/react_queries/profile";
import { useBookingQuery } from "@/app/react_queries/bookings";

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

  const {
    data: summaryData,
    isLoading: summaryLoading,
    isError: summaryError,
  } = useSummaryQuery();

  const {
    data: chartData,
    isLoading: chartLoading,
    isError: chartError,
  } = useChartQuery({ entity, range });

  const { data: profileData } = useProfileQuery();
  const { data: bookingData, isLoading: bookingLoading } = useBookingQuery();

  const isPageLoading = summaryLoading && !summaryData;
  const isPageError = summaryError || chartError;

  const cards = useMemo(() => {
    if (!summaryData?.data) return [];
    return buildStatsCards(summaryData.data);
  }, [summaryData]);

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
    <main className="flex-1 overflow-y-auto bg-background text-foreground">
      <div className="w-full max-w-[1600px] mx-auto p-6 flex flex-col gap-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-black">Dashboard Overview</h1>
            <p className="text-slate-500">
              Here is an overview of your system performance.
            </p>
          </div>

          {profileData && <ProfileDropdown profile={profileData.data} />}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card, index) => (
            <StatCard key={index} {...card} />
          ))}
        </div>

        {/* Chart */}
        <div className="rounded-xl border bg-background text-foreground p-6">
          <div className="flex justify-between mb-6">
            <h3 className="text-lg font-bold">Analytics</h3>

            <div className="flex gap-2">
              <select value={range} onChange={(e) => setRange(e.target.value)}>
                {RANGE.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>

              <select
                value={entity}
                onChange={(e) => setEntity(e.target.value)}
              >
                {ENTITY.map((e) => (
                  <option key={e.value} value={e.value}>
                    {e.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {chartData &&
            (chartLoading ? <ChartSkeleton /> : <ChartBar data={chartData} />)}
        </div>

        {/* Activity */}
        {bookingData &&
          (bookingLoading ? (
            <ActiveTableSkeleton />
          ) : (
            <ActivityTable data={bookingData} />
          ))}
      </div>
    </main>
  );
}
// Stats Card Builder
const buildStatsCards = (stats: any): StatsCard[] => {
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
