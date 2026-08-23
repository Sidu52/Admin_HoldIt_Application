"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BiSearch,
  BiFilter,
  BiUser,
  BiCheckCircle,
  BiTime,
  BiBlock,
  BiStore,
  BiUserCheck,
} from "react-icons/bi";
import { FaTruck, FaStore, FaUser, FaUserTie, FaEye, FaComments } from "react-icons/fa";
import NoData from "@/app/NoData";
import { useGetTicketsQuery, useGetSupportSummaryQuery } from "../../../services/supportApi";
import { SupportTicket, RequesterModel, TicketStatus, TicketPriority } from "@/app/types/support";
import Pagination from "@/app/components/common/Pagination";
import { debounce } from "@/app/utils/helper";
import { TableSkeleton } from "@/app/components/common/Skeleton";
import { socket } from "@/app/lib/socket";

// Requester Role Badge Config
const REQUESTER_CONFIG: Record<RequesterModel, { label: string; icon: React.ReactNode; bg: string; text: string }> = {
  User: {
    label: "User (Customer)",
    icon: <FaUser className="text-xs" />,
    bg: "bg-blue-50 dark:bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
  },
  Driver: {
    label: "Driver",
    icon: <FaTruck className="text-xs" />,
    bg: "bg-amber-50 dark:bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
  },
  Store: {
    label: "Store",
    icon: <FaStore className="text-xs" />,
    bg: "bg-purple-50 dark:bg-purple-500/10",
    text: "text-purple-600 dark:text-purple-400",
  },
  StoreOwner: {
    label: "Store Owner",
    icon: <FaUserTie className="text-xs" />,
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
  },
};

const getRequesterName = (ticket: SupportTicket): string => {
  const req = ticket.requesterId;
  if (!req || typeof req === "string") return ticket.requesterModel || "—";
  if (req.first_name || req.last_name) {
    return `${req.first_name || ""} ${req.last_name || ""}`.trim();
  }
  return req.name || req.store_name || req.email || ticket.requesterModel;
};

const STATUS_CONFIG: Record<TicketStatus, { label: string; bg: string; text: string; dot: string }> = {
  open: { label: "Open", bg: "bg-blue-50 dark:bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", dot: "bg-blue-500" },
  in_progress: { label: "In Progress", bg: "bg-amber-50 dark:bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", dot: "bg-amber-500" },
  pending: { label: "Pending", bg: "bg-purple-50 dark:bg-purple-500/10", text: "text-purple-600 dark:text-purple-400", dot: "bg-purple-500" },
  resolved: { label: "Resolved", bg: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" },
  closed: { label: "Closed", bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-600 dark:text-slate-400", dot: "bg-slate-400" },
};

const PRIORITY_CONFIG: Record<TicketPriority, { label: string; color: string }> = {
  low: { label: "Low", color: "text-slate-500 bg-slate-100 dark:bg-slate-800" },
  medium: { label: "Medium", color: "text-blue-600 bg-blue-50 dark:bg-blue-500/10" },
  high: { label: "High", color: "text-amber-600 bg-amber-50 dark:bg-amber-500/10" },
  urgent: { label: "Urgent", color: "text-rose-600 bg-rose-50 dark:bg-rose-500/10 font-bold" },
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

export default function SupportDeskClient() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedPriority, setSelectedPriority] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const limit = 10;

  const handleSearchChange = useMemo(
    () =>
      debounce((value: string) => {
        setDebouncedSearch(value);
        setCurrentPage(1);
      }, 400),
    []
  );

  const onSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    handleSearchChange(e.target.value);
  };

  const { data: summaryData, isLoading: summaryLoading, refetch: refetchSummary } = useGetSupportSummaryQuery();
  const summary = summaryData?.data;

  const { data, isLoading, isFetching, refetch: refetchTickets } = useGetTicketsQuery({
    page: currentPage,
    limit,
    role: selectedRole || undefined,
    status: selectedStatus || undefined,
    priority: selectedPriority || undefined,
    search: debouncedSearch || undefined,
  });

  // Real-time updates for Support Desk
  useEffect(() => {
    const handleSupportUpdate = () => {
      refetchTickets();
      refetchSummary();
    };

    socket.on("support:new_message", handleSupportUpdate);
    socket.on("support:ticket_created", handleSupportUpdate);
    socket.on("support:ticket_escalated", handleSupportUpdate);
    socket.on("support:status_updated", handleSupportUpdate);

    return () => {
      socket.off("support:new_message", handleSupportUpdate);
      socket.off("support:ticket_created", handleSupportUpdate);
      socket.off("support:ticket_escalated", handleSupportUpdate);
      socket.off("support:status_updated", handleSupportUpdate);
    };
  }, [refetchTickets, refetchSummary]);

  const tickets = data?.data?.tickets || [];
  const pagination = data?.data?.pagination;

  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
    setCurrentPage(1);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-background text-foreground p-6 space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FaComments className="text-primary" /> Support Desk
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage support tickets and inquiries across Users, Drivers, Stores & Store Owners.
          </p>
        </div>
      </div>

      {/* ── Summary Stats Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-white dark:bg-[#1a2332] p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Open</p>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {summaryLoading ? "—" : summary?.openCount ?? 0}
          </p>
        </div>
        <div className="bg-white dark:bg-[#1a2332] p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">In Progress</p>
          <p className="text-2xl font-black text-amber-500 mt-1">
            {summaryLoading ? "—" : summary?.inProgressCount ?? 0}
          </p>
        </div>
        <div className="bg-white dark:bg-[#1a2332] p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending</p>
          <p className="text-2xl font-black text-purple-500 mt-1">
            {summaryLoading ? "—" : summary?.pendingCount ?? 0}
          </p>
        </div>
        <div className="bg-white dark:bg-[#1a2332] p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Live Chats</p>
          <p className="text-2xl font-black text-emerald-500 mt-1">
            {summaryLoading ? "—" : summary?.liveChatCount ?? 0}
          </p>
        </div>
        <div className="bg-white dark:bg-[#1a2332] p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Resolved</p>
          <p className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-1">
            {summaryLoading ? "—" : summary?.resolvedCount ?? 0}
          </p>
        </div>
        <div className="bg-white dark:bg-[#1a2332] p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Unassigned</p>
          <p className="text-2xl font-black text-rose-500 mt-1">
            {summaryLoading ? "—" : summary?.unassignedCount ?? 0}
          </p>
        </div>
      </div>

      {/* ── Role Filter Tabs (User, Driver, Store, Store Owner) ── */}
      <div className="bg-white dark:bg-[#1a2332] rounded-xl border border-slate-200 dark:border-slate-700/50 p-2">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => handleRoleChange("")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedRole === ""
                ? "bg-primary text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            All Requesters ({summaryLoading ? "—" : (summary?.openCount ?? 0) + (summary?.inProgressCount ?? 0) + (summary?.resolvedCount ?? 0)})
          </button>
          <button
            onClick={() => handleRoleChange("User")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedRole === "User"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <FaUser className="text-xs" /> Users ({summary?.byRole?.User ?? 0})
          </button>
          <button
            onClick={() => handleRoleChange("Driver")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedRole === "Driver"
                ? "bg-amber-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <FaTruck className="text-xs" /> Drivers ({summary?.byRole?.Driver ?? 0})
          </button>
          <button
            onClick={() => handleRoleChange("Store")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedRole === "Store"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <FaStore className="text-xs" /> Stores ({summary?.byRole?.Store ?? 0})
          </button>
          <button
            onClick={() => handleRoleChange("StoreOwner")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedRole === "StoreOwner"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <FaUserTie className="text-xs" /> Store Owners ({summary?.byRole?.StoreOwner ?? 0})
          </button>
        </div>
      </div>

      {/* ── Controls & Filters Bar ── */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <BiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
          <input
            type="text"
            placeholder="Search by ticket code or subject..."
            value={searchQuery}
            onChange={onSearchInputChange}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#1a2332] border border-slate-200 dark:border-slate-700/50 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Status Select */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2.5 bg-white dark:bg-[#1a2332] border border-slate-200 dark:border-slate-700/50 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>

          {/* Priority Select */}
          <select
            value={selectedPriority}
            onChange={(e) => {
              setSelectedPriority(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2.5 bg-white dark:bg-[#1a2332] border border-slate-200 dark:border-slate-700/50 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      {/* ── Table & List ── */}
      <div className="bg-white dark:bg-[#1a2332] rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm overflow-hidden flex-1 flex flex-col">
        {isLoading || isFetching ? (
          <div className="p-4">
            <TableSkeleton rows={6} cols={7} />
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-8">
            <NoData title="No support tickets found matching criteria." />
          </div>
        ) : (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse text-xs min-w-[800px]">
              <thead className="sticky top-0 z-10 bg-slate-50/90 dark:bg-slate-800/90 backdrop-blur-sm">
                <tr className="border-b border-slate-200 dark:border-slate-700/50 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Ticket</th>
                  <th className="py-3.5 px-4">Requester</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Subject</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Last Activity</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-slate-700 dark:text-slate-300">
                {tickets.map((ticket: SupportTicket) => {
                  const reqConfig = REQUESTER_CONFIG[ticket.requesterModel] || REQUESTER_CONFIG.User;
                  const statusCfg = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
                  const prioCfg = PRIORITY_CONFIG[ticket.priority] || PRIORITY_CONFIG.medium;
                  const requesterName = getRequesterName(ticket);

                  return (
                    <tr key={ticket._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {ticket.ticketCode || ticket._id.substring(0, 8)}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">
                        {requesterName}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold text-[11px] ${reqConfig.bg} ${reqConfig.text}`}>
                          {reqConfig.icon}
                          {ticket.requesterModel}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 max-w-[220px] truncate font-medium text-slate-900 dark:text-white">
                        {ticket.subject}
                      </td>
                      <td className="py-3.5 px-4 capitalize text-slate-500">
                        {ticket.category || "General"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${prioCfg.color}`}>
                          {prioCfg.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${statusCfg.bg} ${statusCfg.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        {formatDate(ticket.lastMessageAt || ticket.updatedAt)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => router.push(`/support/${ticket._id}`)}
                          className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ml-auto"
                        >
                          <FaEye className="text-xs" /> View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {pagination && pagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/40">
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
