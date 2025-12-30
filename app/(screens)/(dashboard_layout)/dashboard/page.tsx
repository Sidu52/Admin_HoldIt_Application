"use client";

import { useState, useEffect } from "react";
import StatCard from "@/app/components/Dashboard/StatCard";
import ActivityTable from "@/app/components/Dashboard/ActivityTable";
import ChartBar from "@/app/components/Dashboard/ChartBar";
import {
  FaUsers,
  FaTruck,
  FaStore,
  FaCalendarAlt,
  FaSearch,
  FaCog,
} from "react-icons/fa";
import ProfileDropdown from "@/app/components/Dashboard/ProfileDropdown";

// Mock data
const STATS_DATA = [
  {
    title: "Users",
    value: "24,592",
    icon: <FaUsers className="text-xl" />,
    iconColor: "text-blue-600 dark:text-blue-400",
    iconBgColor: "bg-blue-100 dark:bg-blue-500/10",
    trend: { value: "+15%", isPositive: true, label: "vs last month" }
  },
  {
    title: "Drivers",
    value: "1,042",
    icon: <FaTruck className="text-xl" />,
    iconColor: "text-purple-600 dark:text-purple-400",
    iconBgColor: "bg-purple-100 dark:bg-purple-500/10",
    trend: { value: "+12%", isPositive: true, label: "vs last month" }
  },
  {
    title: "Stores",
    value: "482",
    icon: <FaStore className="text-xl" />,
    iconColor: "text-orange-600 dark:text-orange-400",
    iconBgColor: "bg-orange-100 dark:bg-orange-500/10",
    trend: { value: "+8%", isPositive: true, label: "vs last week" }
  },
  {
    title: "Bookings",
    value: "8,932",
    icon: <FaCalendarAlt className="text-xl" />,
    iconColor: "text-emerald-600 dark:text-emerald-400",
    iconBgColor: "bg-emerald-100 dark:bg-emerald-500/10",
    trend: { value: "+22%", isPositive: true, label: "this month" }
  }
];

const CHART_DATA = [
  { day: "Mon", value: 40, maxValue: 100 },
  { day: "Tue", value: 60, maxValue: 100 },
  { day: "Wed", value: 50, maxValue: 100 },
  { day: "Thu", value: 80, maxValue: 100 },
  { day: "Fri", value: 95, maxValue: 100 },
  { day: "Sat", value: 70, maxValue: 100 },
  { day: "Sun", value: 55, maxValue: 100 }
];

const ACTIVITY_DATA = [
  {
    id: "1",
    bookingId: "#BK-9281",
    userName: "John Doe",
    userEmail: "john.d@email.com",
    userAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDmG9klbPGOyRFop9bzgyGmBuXbQQauFgrfnjKxt_N3GSL1LwvFR-QhaewIjlmKUXvrG1jjg6Q6LfVMxlxRtRJTtvvtXUVwR90gFbse14MGUL0DASTGoJQm5kDhoBWP9CwfeGBUzW7CkvYKdVFewmYXlVVKv0aHfTa6bZEW0Q3WCCCbyDHibnd80-GO0yKGdrtmRA4trm8Mf4FpSpeMUzEFOT21_gCYBSNMfv3FmeT5mw3OTNIyEsmONRGVFKkGGUpJwUHbEezCDh04",
    status: "completed" as const,
    bookingTime: "Oct 24, 2023 10:30 AM"
  },
  {
    id: "2",
    bookingId: "#BK-9282",
    userName: "Sarah Jenkins",
    userEmail: "sarah.j@email.com",
    userAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCw1GdHKASsODjAKLxcjD0JFOIuWsutnGVE40j0ExRbeKRYpilYfuikQlvIIK7aJXFIRmIz8SKi93Ar7KsdjGcUYE_CiJPAP5_Z9NFD-VODmplEKf4GlzQtvqkpAaYOlBnrNoOdIPcZqLV5rnlrIdeb9NgskrRMpJV8ZFKlQzDAEE57kMIhKqXfF9ECkfOFYOEoXJHIR6F7pFp5VAm3jg8vE5YMhvCCV0ISUEjyWUU3ByrIbwvTTiymqlpP4o5g4nR40k-DaSu1JjYL",
    status: "in-progress" as const,
    bookingTime: "Oct 24, 2023 11:15 AM"
  },
  {
    id: "3",
    bookingId: "#BK-9283",
    userName: "Mike Ross",
    userEmail: "mike.ross@email.com",
    userAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCNSKo9jf8jssW_qflkBLJF4TQDLvQdKMfPvqukLyjWZFUZVLJmym0l2230wfoNwWKOhUO7wNKq8CfPpO13CX3W7ZDWU2HhbwrAkTlcmIiFQcf-eWhQkr7PKvVsJANI7y16yEXcVfQZtflsfllWB10H8gs9m01G_l57-X-u0pvYYlw_khqiMFRLWqObLgAyxCX2b12weYgo0ox8KXPvwdR3XfEEu9Pa42wqYBvxuTasQx9qVd_dGmi6fgvhRf5HtB3DPSQYSR-VqNUI",
    status: "pending" as const,
    bookingTime: "Oct 24, 2023 11:45 AM"
  },
  {
    id: "4",
    bookingId: "#BK-9284",
    userName: "Jane Tan",
    userEmail: "jane.t@email.com",
    userAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBIEz1ZPG7vZqN2x5iQYinM7nIzE_gcCdA93bT9TP26WRNu_C0RyryDo1pnf4-RPRliSJpwR9aLzpseWgxWUJMO1GGZXfk8HdOOPDqa5oGIyBJby_75_S3-9pMXZgT-uNVxlnmLdtlUTFB-0N_WZvhQIXAARSqNQvmxYT1zR1MmHXYbfVggmuih_zifWKSzXrOjc3z82qfuWaINTciB-oFtQ9xcJ9ehLVNptkb0I9bgkHRAblaMOijQAtTAFbBLrrlCOachgcadm9Y_",
    status: "cancelled" as const,
    bookingTime: "Oct 24, 2023 12:05 PM"
  },
  {
    id: "5",
    bookingId: "#BK-9285",
    userName: "Tom Baker",
    userEmail: "tom.baker@email.com",
    userAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDNmrbeKEIdGuLUqVCPnWPOtxaf3nqTkeGCkeE_tbojwq9Wqp0z7L1_WTOEfk-x11IMdBL8roU1wWYHYXM0lRcpsmeUMBykn_zWvzoO2waLtjCYWrtdsBwogvypU4pn6MOQAiWaM7m4ML19Gb8VnEXwN42iOPyxzBW5x0N_6vBs47FWuTbD5Uv-YbdifrfTIE2dyGTpAgvQ8wzrrEZkE_TpqtHcoASwDy6Yf-NkPt2TdHgz4i8-w45-A1iDLhCQatvrBVq9UvJdPrl2",
    status: "completed" as const,
    bookingTime: "Oct 24, 2023 01:22 PM"
  }
];

export default function DashboardPage() {

  const [currentPage, setCurrentPage] = useState(1);
  const [timeRange, setTimeRange] = useState("This Week");


  const handleViewDetails = (id: string) => {
    console.log("View details for:", id);
    // Implement view details logic
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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
          {STATS_DATA.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Analytics Chart */}
        <div className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e293b] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Booking Analytics
            </h3>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2"
            >
              <option>This Week</option>
              <option>Last Week</option>
              <option>This Month</option>
              <option>Last Month</option>
            </select>
          </div>
          <ChartBar data={CHART_DATA} />
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
          <ActivityTable
            activities={ACTIVITY_DATA}
            currentPage={currentPage}
            totalPages={Math.ceil(8932 / 5)}
            totalItems={8932}
            onPageChange={handlePageChange}
            onViewDetails={handleViewDetails}
          />
        </div>
      </div>
    </main>
  );
}