"use client";

import { useState, useEffect, useMemo } from "react";
import { useAppDispatch } from "@/app/store/hooks";
import { setBookings } from "@/app/store/slices/bookingSlice";
import { setChart, setSummary } from "@/app/store/slices/dashboardSlice";
import StatCard from "@/app/components/Dashboard/StatCard";
import ActivityTable from "@/app/components/Dashboard/ActivityTable";
import ChartBar from "@/app/components/Dashboard/ChartBar";
import ProfileDropdown from "@/app/components/Dashboard/ProfileDropdown";
import { chart, summary } from "@/app/hooks/useDashboard";
import { getBooking } from "@/app/hooks/useBooking";
import { FaClipboardList, FaStore, FaTruck, FaUsers } from "react-icons/fa";
import {
  CardSkeleton,
  ChartSkeleton,
  ActiveTableSkeleton,
} from "@/app/loading/dashboard";
import { Stats, StatsCard } from "@/app/types/dashboard";

const RANGE = [
  { label: "Today", value: "today" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "Last 3 Month", value: "last_3_months" },
];

const ENTITY = [
  { label: "Booking", value: "booking" },
  { label: "User", value: "user" },
];

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const [entity, setEntity] = useState("user");
  const [range, setRange] = useState("week");

  // Data fetching hooks
  const {
    data: summaryData,
    isLoading: summaryLoading,
    error: summaryError,
  } = summary();
  const {
    data: chartData,
    isLoading: chartLoading,
    error: chartError,
  } = chart(entity, range);
  const {
    data: BookingData,
    isLoading: bookingLoading,
    error: bookingError,
  } = getBooking();

  // Memoize the cards to avoid unnecessary recalculations
  const cards = useMemo(
    () => buildStatsCards(summaryData?.data?.data),
    [summaryData?.data?.data]
  );

  // Dispatch actions on data updates
  useEffect(() => {
    if (summaryData) {
      dispatch(setSummary(summaryData.data.data));
    }
  }, [summaryData, dispatch]);
  useEffect(() => {
    if (BookingData) {
      dispatch(setBookings(BookingData.data.data));
    }
  }, [BookingData, dispatch]);
  useEffect(() => {
    if (chartData?.data?.data) {
      dispatch(setChart(chartData.data.data));
    }
  }, [chartData, dispatch]);

  // Early returns for loading and error states
  if (summaryLoading || chartLoading || bookingLoading) {
    return (
      <main className="flex-1 overflow-y-auto">
        <div className="w-full max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 space-y-8">
          <CardSkeleton />
          <ChartSkeleton />
          <ActiveTableSkeleton />
        </div>
      </main>
    );
  }

  if (summaryError || chartError || bookingError) {
    return <div>Error loading data.</div>;
  }

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="w-full max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-black tracking-tight">
              Dashboard Overview
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-base">
              Here is an overview of your managed system performance.
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Profile Dropdown */}
            <ProfileDropdown />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card, index) => (
            <StatCard key={index} {...card} />
          ))}
        </div>

        {/* Analytics Chart */}
        <div className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e293b] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Booking Analytics
            </h3>
            <div className="flex items-center gap-2">
              <select
                value={range}
                onChange={(e) => setRange(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2"
              >
                {RANGE.map((range, index) => (
                  <option key={index} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
              <select
                value={entity}
                onChange={(e) => setEntity(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2"
              >
                {ENTITY.map((entity, index) => (
                  <option key={index} value={entity.value}>
                    {entity.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <ChartBar />
        </div>

        {/* Recent Activity */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-slate-900 dark:text-white text-xl font-bold tracking-tight">
              Recent Activity
            </h2>
            <button className="text-sm font-medium text-primary hover:text-blue-400 transition-colors">
              View All
            </button>
          </div>
          <ActivityTable />
        </div>
      </div>
    </main>
  );
}

const buildStatsCards = (stats: Stats): StatsCard[] => {
  if (!stats) return [];

  return [
    // Bookings Today Card
    {
      title: "Bookings Today",
      value: stats.booking.totalToday,
      icon: <FaClipboardList />,
      iconBgColor: "bg-blue-100 dark:bg-blue-500/10",
      iconColor: "text-blue-600 dark:text-blue-400",
      stats: [
        {
          label: "In Progress",
          value: stats.booking.inProgress, // Assuming this value exists in the stats object
          bgColor: "bg-blue-100 dark:bg-blue-500/10",
          textColor: "text-blue-600 dark:text-blue-400",
        },
        {
          label: "Completed",
          value: stats.booking.completed, // Assuming this value exists in the stats object
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
