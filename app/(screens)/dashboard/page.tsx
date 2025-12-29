"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import LoadingSpinner from "@/app/components/Common/LoadingSpinner";
import TokenMonitor from "../../components/Auth/TokenMonitor";
import {
  FaGlobe,
  FaUsers,
  FaCalendarAlt,
  FaTruck,
  FaSearch,
  FaPlus,
} from "react-icons/fa";
import DashboardLayout from "@/app/components/Layout/DashboardLayout";
import StatCard from "@/app/components/Dashboard/StatCard";
import RecentActivityTable from "@/app/components/Dashboard/RecentActivityTable";

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Mock data for stat cards
  const statCards = [
    {
      title: "Total Websites",
      value: "124",
      icon: <FaGlobe className="text-xl" />,
      trend: { value: "+5%", isPositive: true, label: "vs last month" },
      color: "blue" as const,
    },
    {
      title: "Active Users",
      value: "1,042",
      icon: <FaUsers className="text-xl" />,
      trend: { value: "+12%", isPositive: true, label: "vs last month" },
      color: "purple" as const,
    },
    {
      title: "New Bookings",
      value: "38",
      icon: <FaCalendarAlt className="text-xl" />,
      trend: { value: "+8%", isPositive: true, label: "vs last week" },
      color: "orange" as const,
    },
    {
      title: "Pending Drivers",
      value: "12",
      icon: <FaTruck className="text-xl" />,
      trend: { value: "Action Needed", isPositive: false, label: "approvals" },
      color: "red" as const,
    },
  ];

  // Mock data for recent activities
  const recentActivities = [
    {
      id: "1",
      name: "TechFlow Inc",
      description: "techflow.io",
      manager: {
        name: "John Doe",
        avatar:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuDmG9klbPGOyRFop9bzgyGmBuXbQQauFgrfnjKxt_N3GSL1LwvFR-QhaewIjlmKUXvrG1jjg6Q6LfVMxlxRtRJTtvvtXUVwR90gFbse14MGUL0DASTGoJQm5kDhoBWP9CwfeGBUzW7CkvYKdVFewmYXlVVKv0aHfTa6bZEW0Q3WCCCbyDHibnd80-GO0yKGdrtmRA4trm8Mf4FpSpeMUzEFOT21_gCYBSNMfv3FmeT5mw3OTNIyEsmONRGVFKkGGUpJwUHbEezCDh04",
      },
      status: "active" as const,
      type: "website" as const,
      lastUpdated: "2 hours ago",
      initials: "TF",
      color: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
    },
    {
      id: "2",
      name: "Sarah Jenkins",
      description: "Driver #4821",
      manager: {
        name: "Ops Team",
        avatar:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCw1GdHKASsODjAKLxcjD0JFOIuWsutnGVE40j0ExRbeKRYpilYfuikQlvIIK7aJXFIRmIz8SKi93Ar7KsdjGcUYE_CiJPAP5_Z9NFD-VODmplEKf4GlzQtvqkpAaYOlBnrNoOdIPcZqLV5rnlrIdeb9NgskrRMpJV8ZFKlQzDAEE57kMIhKqXfF9ECkfOFYOEoXJHIR6F7pFp5VAm3jg8vE5YMhvCCV0ISUEjyWUU3ByrIbwvTTiymqlpP4o5g4nR40k-DaSu1JjYL",
      },
      status: "on-route" as const,
      type: "driver" as const,
      lastUpdated: "5 mins ago",
      initials: "SJ",
      color: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
    },
    {
      id: "3",
      name: "Downtown Store",
      description: "Loc: 5th Ave",
      manager: {
        name: "Mike Ross",
        avatar:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCNSKo9jf8jssW_qflkBLJF4TQDLvQdKMfPvqukLyjWZFUZVLJmym0l2230wfoNwWKOhUO7wNKq8CfPpO13CX3W7ZDWU2HhbwrAkTlcmIiFQcf-eWhQkr7PKvVsJANI7y16yEXcVfQZtflsfllWB10H8gs9m01G_l57-X-u0pvYYlw_khqiMFRLWqObLgAyxCX2b12weYgo0ox8KXPvwdR3XfEEu9Pa42wqYBvxuTasQx9qVd_dGmi6fgvhRf5HtB3DPSQYSR-VqNUI",
      },
      status: "maintenance" as const,
      type: "store" as const,
      lastUpdated: "3 days ago",
      initials: "DS",
      color: "linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)",
    },
    {
      id: "4",
      name: "Booking #9921",
      description: "Client: J. Tan",
      manager: {
        name: "System",
        avatar:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuBIEz1ZPG7vZqN2x5iQYinM7nIzE_gcCdA93bT9TP26WRNu_C0RyryDo1pnf4-RPRliSJpwR9aLzpseWgxWUJMO1GGZXfk8HdOOPDqa5oGIyBJby_75_S3-9pMXZgT-uNVxlnmLdtlUTFB-0N_WZvhQIXAARSqNQvmxYT1zR1MmHXYbfVggmuih_zifWKSzXrOjc3z82qfuWaINTciB-oFtQ9xcJ9ehLVNptkb0I9bgkHRAblaMOijQAtTAFbBLrrlCOachgcadm9Y_",
      },
      status: "pending" as const,
      type: "booking" as const,
      lastUpdated: "1 hour ago",
      initials: "BK",
      color: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    },
    {
      id: "5",
      name: "News Daily",
      description: "newsdaily.org",
      manager: {
        name: "Tom Baker",
        avatar:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuDNmrbeKEIdGuLUqVCPnWPOtxaf3nqTkeGCkeE_tbojwq9Wqp0z7L1_WTOEfk-x11IMdBL8roU1wWYHYXM0lRcpsmeUMBykn_zWvzoO2waLtjCYWrtdsBwogvypU4pn6MOQAiWaM7m4ML19Gb8VnEXwN42iOPyxzBW5x0N_6vBs47FWuTbD5Uv-YbdifrfTIE2dyGTpAgvQ8wzrrEZkE_TpqtHcoASwDy6Yf-NkPt2TdHgz4i8-w45-A1iDLhCQatvrBVq9UvJdPrl2",
      },
      status: "active" as const,
      type: "website" as const,
      lastUpdated: "2 weeks ago",
      initials: "ND",
      color: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
    },
  ];

  const handleCreateNew = () => {
    // Implement create new functionality
    console.log("Create new clicked");
  };

  const handleViewAll = () => {
    // Implement view all functionality
    console.log("View all clicked");
  };

  return (
    <DashboardLayout>
      <TokenMonitor />
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-black tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-base">
            Here is an overview of your managed system performance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="relative hidden sm:block">
            <FaSearch className="absolute left-3 top-2.5 text-slate-400 text-sm" />
            <input
              className="h-10 pl-10 pr-4 rounded-lg bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white w-64 placeholder-slate-400"
              placeholder="Search..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Create New Button */}
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 cursor-pointer justify-center rounded-lg h-10 px-5 bg-primary hover:bg-blue-600 text-white text-sm font-bold shadow-lg shadow-blue-500/20 transition-all transform hover:-translate-y-0.5"
          >
            <FaPlus className="text-lg" />
            <span>Create New</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => (
          <StatCard
            key={index}
            title={card.title}
            value={card.value}
            icon={card.icon}
            trend={card.trend}
            color={card.color}
            isLoading={isLoading}
          />
        ))}
      </div>

      {/* Recent Activity Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-slate-900 dark:text-white text-xl font-bold tracking-tight">
            Recent Activity
          </h2>
          <button
            onClick={handleViewAll}
            className="text-sm font-medium text-primary hover:text-blue-400 transition-colors"
          >
            View All
          </button>
        </div>

        <RecentActivityTable
          activities={recentActivities}
          isLoading={isLoading}
        />
      </div>

      {/* Quick Stats Footer */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#1e293b] rounded-lg p-4 border border-slate-200 dark:border-slate-800">
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Avg. Response Time
          </p>
          <p className="text-slate-900 dark:text-white text-2xl font-bold">
            1.2s
          </p>
        </div>
        <div className="bg-white dark:bg-[#1e293b] rounded-lg p-4 border border-slate-200 dark:border-slate-800">
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            System Uptime
          </p>
          <p className="text-slate-900 dark:text-white text-2xl font-bold">
            99.9%
          </p>
        </div>
        <div className="bg-white dark:bg-[#1e293b] rounded-lg p-4 border border-slate-200 dark:border-slate-800">
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Active Sessions
          </p>
          <p className="text-slate-900 dark:text-white text-2xl font-bold">
            247
          </p>
        </div>
        <div className="bg-white dark:bg-[#1e293b] rounded-lg p-4 border border-slate-200 dark:border-slate-800">
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Storage Used
          </p>
          <p className="text-slate-900 dark:text-white text-2xl font-bold">
            68%
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
