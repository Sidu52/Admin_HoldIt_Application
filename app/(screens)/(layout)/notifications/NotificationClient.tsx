"use client";

import { useState, useMemo, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import {
  RiNotification3Line,
  RiSendPlaneFill,
  RiUserLine,
  RiTruckLine,
  RiBroadcastLine,
  RiSearchLine,
  RiTimeLine,
  RiCheckDoubleLine,
  RiInformationLine,
  RiSmartphoneLine,
  RiVolumeUpLine,
  RiFlashlightLine,
  RiCloseLine,
  RiHistoryLine,
} from "react-icons/ri";
import {
  FaUsers,
  FaTruck,
  FaUserCheck,
  FaBolt,
  FaUser,
  FaShieldAlt,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import {
  useGetAudienceSummaryQuery,
  useGetNotificationHistoryQuery,
  useLazySearchRecipientsQuery,
  useSendPushNotificationMutation,
} from "@/app/services/notificationApi";
import { TargetAudience, RecipientOption } from "@/app/types/notification";
import toast from "react-hot-toast";
import Pagination from "@/app/components/common/Pagination";
import { TableSkeleton } from "@/app/components/common/Skeleton";
import NoData from "@/app/NoData";

// Quick Notification Templates
const TEMPLATES = [
  {
    label: "🎉 Promotional Discount",
    title: "Special Weekend Offer! 🎁",
    body: "Store your luggage today and enjoy 20% off on your first 24 hours of storage!",
    screen: "book-now",
    audience: "ALL_USERS" as TargetAudience,
  },
  {
    label: "🛵 Driver High Demand",
    title: "High Demand in Your Area! ⚡",
    body: "Multiple luggage pickup requests are waiting nearby. Go online now to boost your earnings!",
    screen: "dashboard",
    audience: "ALL_ONLINE_DRIVERS" as TargetAudience,
  },
  {
    label: "🌧️ Weather Advisory",
    title: "Service Update: Weather Advisory 🌧️",
    body: "Please allow extra time for luggage pickups and deliveries due to local weather conditions.",
    screen: "home",
    audience: "BROADCAST_ALL" as TargetAudience,
  },
  {
    label: "🧳 Luggage Storage Reminder",
    title: "Need Luggage Storage? 🧳",
    body: "Drop off your bags at our nearest verified vault and explore the city hands-free!",
    screen: "home",
    audience: "ALL_ACTIVE_USERS" as TargetAudience,
  },
];

const AUDIENCE_OPTIONS: {
  id: TargetAudience;
  label: string;
  sub: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  {
    id: "ALL_USERS",
    label: "All Users",
    sub: "Every registered customer",
    icon: <FaUsers className="text-blue-500 text-lg" />,
    color: "border-blue-500/30 bg-blue-500/5 text-blue-600 dark:text-blue-400",
  },
  {
    id: "ALL_ACTIVE_USERS",
    label: "Active Users",
    sub: "Users with active accounts",
    icon: <FaUserCheck className="text-emerald-500 text-lg" />,
    color: "border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400",
  },
  {
    id: "ALL_DRIVERS",
    label: "All Drivers",
    sub: "All verified delivery partners",
    icon: <FaTruck className="text-amber-500 text-lg" />,
    color: "border-amber-500/30 bg-amber-500/5 text-amber-600 dark:text-amber-400",
  },
  {
    id: "ALL_ONLINE_DRIVERS",
    label: "Online Drivers",
    sub: "Drivers currently available online",
    icon: <FaBolt className="text-purple-500 text-lg" />,
    color: "border-purple-500/30 bg-purple-500/5 text-purple-600 dark:text-purple-400",
  },
  {
    id: "SPECIFIC_USER",
    label: "Specific User",
    sub: "Target a single customer by search",
    icon: <FaUser className="text-cyan-500 text-lg" />,
    color: "border-cyan-500/30 bg-cyan-500/5 text-cyan-600 dark:text-cyan-400",
  },
  {
    id: "SPECIFIC_DRIVER",
    label: "Specific Driver",
    sub: "Target an individual driver by search",
    icon: <RiTruckLine className="text-orange-500 text-lg" />,
    color: "border-orange-500/30 bg-orange-500/5 text-orange-600 dark:text-orange-400",
  },
  {
    id: "BROADCAST_ALL",
    label: "Broadcast All",
    sub: "Blasts to both Users and Drivers",
    icon: <RiBroadcastLine className="text-rose-500 text-lg" />,
    color: "border-rose-500/30 bg-rose-500/5 text-rose-600 dark:text-rose-400",
  },
];

export default function NotificationClient() {
  const currentUser = useSelector((state: RootState) => state.auth.user);

  // Form State
  const [targetAudience, setTargetAudience] = useState<TargetAudience>("ALL_USERS");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [screen, setScreen] = useState("home");
  const [priority, setPriority] = useState<"high" | "normal">("high");
  const [sound, setSound] = useState<"default" | "none">("default");

  // Specific Recipient State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecipient, setSelectedRecipient] = useState<RecipientOption | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // History Filter
  const [historyPage, setHistoryPage] = useState(1);
  const [historySearch, setHistorySearch] = useState("");

  // RTK Query Hooks
  const { data: summaryData, isLoading: isSummaryLoading, refetch: refetchSummary } = useGetAudienceSummaryQuery();
  const { data: historyData, isLoading: isHistoryLoading } = useGetNotificationHistoryQuery({
    page: historyPage,
    limit: 10,
    search: historySearch,
  });
  const [triggerSearch, { data: searchResults, isFetching: isSearching }] = useLazySearchRecipientsQuery();
  const [sendPush, { isLoading: isSending }] = useSendPushNotificationMutation();

  // Search debounce
  useEffect(() => {
    if (targetAudience === "SPECIFIC_USER" || targetAudience === "SPECIFIC_DRIVER") {
      const timeoutId = setTimeout(() => {
        triggerSearch({
          query: searchQuery,
          type: targetAudience === "SPECIFIC_DRIVER" ? "DRIVER" : "USER",
        });
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery, targetAudience, triggerSearch]);

  const audience = summaryData?.data;

  // Estimated recipient count based on selection
  const estimatedReach = useMemo(() => {
    if (!audience) return 0;
    switch (targetAudience) {
      case "ALL_USERS":
        return audience.users.withToken;
      case "ALL_ACTIVE_USERS":
        return audience.users.activeWithToken;
      case "ALL_DRIVERS":
        return audience.drivers.withToken;
      case "ALL_ONLINE_DRIVERS":
        return audience.drivers.onlineWithToken;
      case "BROADCAST_ALL":
        return audience.totalReachableDevices;
      case "SPECIFIC_USER":
      case "SPECIFIC_DRIVER":
        return selectedRecipient?.hasPushToken ? 1 : 0;
      default:
        return 0;
    }
  }, [audience, targetAudience, selectedRecipient]);

  // Apply template
  const handleApplyTemplate = (tmpl: typeof TEMPLATES[0]) => {
    setTitle(tmpl.title);
    setBody(tmpl.body);
    setScreen(tmpl.screen);
    setTargetAudience(tmpl.audience);
    setSelectedRecipient(null);
    toast.success(`Template applied: ${tmpl.label}`);
  };

  // Submit Handler
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a notification title");
      return;
    }

    if (!body.trim()) {
      toast.error("Please enter a notification message body");
      return;
    }

    if ((targetAudience === "SPECIFIC_USER" || targetAudience === "SPECIFIC_DRIVER") && !selectedRecipient) {
      toast.error("Please select a target recipient");
      return;
    }

    if (estimatedReach === 0 && !selectedRecipient?.hasPushToken) {
      toast.error("No registered push token devices found for this audience");
      return;
    }

    try {
      const res = await sendPush({
        title: title.trim(),
        body: body.trim(),
        targetAudience,
        targetRecipientId: selectedRecipient?._id || null,
        screen,
        priority,
        sound,
      }).unwrap();

      toast.success(res.message || `Push sent to ${res.data.recipientCount} device(s)!`);

      // Reset form
      setTitle("");
      setBody("");
      setSelectedRecipient(null);
      setSearchQuery("");
      refetchSummary();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to dispatch push notification");
    }
  };

  return (
    <div className="p-6 md:p-8 flex flex-col gap-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 text-primary rounded-2xl">
              <RiNotification3Line className="text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Push Notification Center
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Send real-time mobile push notifications to users and drivers instantly.
              </p>
            </div>
          </div>
        </div>

        {/* Authorized Roles Pill */}
        <div className="flex items-center gap-2 px-3.5 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-semibold self-start md:self-auto">
          <FaShieldAlt className="text-sm" />
          <span>Super Admin • Admin • Operation Manager</span>
        </div>
      </div>

      {/* Reach Overview Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Users Reachable</span>
            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl">
              <FaUsers />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
            {isSummaryLoading ? "—" : audience?.users.withToken.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500">
            <span className="text-emerald-500 font-semibold">{audience?.users.activeWithToken || 0}</span> active accounts
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Drivers Reachable</span>
            <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
              <FaTruck />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
            {isSummaryLoading ? "—" : audience?.drivers.withToken.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500">
            <span className="text-amber-500 font-semibold">{audience?.drivers.total || 0}</span> registered total
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Online Drivers</span>
            <div className="p-2 bg-purple-500/10 text-purple-500 rounded-xl">
              <FaBolt />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
            {isSummaryLoading ? "—" : audience?.drivers.onlineWithToken.toLocaleString()}
          </div>
          <div className="text-xs text-emerald-500 font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" /> Live active on road
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Broadcast Reach</span>
            <div className="p-2 bg-rose-500/10 text-rose-500 rounded-xl">
              <RiBroadcastLine />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
            {isSummaryLoading ? "—" : audience?.totalReachableDevices.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500">Combined device subscriber tokens</div>
        </div>
      </div>

      {/* Main Composer & Mockup Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Composer (8 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
          <form onSubmit={handleSend} className="flex flex-col gap-6">
            {/* Quick Templates Bar */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
                Quick Notification Templates
              </label>
              <div className="flex flex-wrap gap-2">
                {TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyTemplate(tmpl)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-primary/10 hover:text-primary transition-all text-slate-700 dark:text-slate-300 border border-transparent hover:border-primary/20"
                  >
                    {tmpl.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Audience Selector */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  Target Audience
                  <span className="text-rose-500">*</span>
                </label>
                <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-bold">
                  Estimated Reach: {estimatedReach.toLocaleString()} devices
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5">
                {AUDIENCE_OPTIONS.map((opt) => {
                  const isSelected = targetAudience === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setTargetAudience(opt.id);
                        if (opt.id !== "SPECIFIC_USER" && opt.id !== "SPECIFIC_DRIVER") {
                          setSelectedRecipient(null);
                        }
                      }}
                      className={`p-3 rounded-2xl border text-left flex flex-col gap-1.5 transition-all relative ${
                        isSelected
                          ? `${opt.color} border-current ring-2 ring-current/20 shadow-sm`
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        {opt.icon}
                        {isSelected && <FaCheckCircle className="text-xs" />}
                      </div>
                      <div className="font-bold text-xs leading-tight text-slate-900 dark:text-white">
                        {opt.label}
                      </div>
                      <div className="text-[10px] text-slate-500 line-clamp-1">{opt.sub}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Specific Recipient Search Dropdown */}
            {(targetAudience === "SPECIFIC_USER" || targetAudience === "SPECIFIC_DRIVER") && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col gap-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Search & Select {targetAudience === "SPECIFIC_DRIVER" ? "Driver" : "User"}
                </label>

                {selectedRecipient ? (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                        {selectedRecipient.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                          {selectedRecipient.name}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-2">
                          <span>{selectedRecipient.phone}</span>
                          {selectedRecipient.hasPushToken ? (
                            <span className="text-emerald-500 font-semibold text-[10px]">● Device Registered</span>
                          ) : (
                            <span className="text-rose-500 font-semibold text-[10px]">● No Push Token</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedRecipient(null)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      <RiCloseLine className="text-lg" />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="relative">
                      <RiSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                      <input
                        type="text"
                        placeholder={`Search by name, phone or email...`}
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setIsSearchOpen(true);
                        }}
                        onFocus={() => setIsSearchOpen(true)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>

                    {isSearchOpen && (
                      <div className="absolute z-30 left-0 right-0 top-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl max-h-60 overflow-y-auto p-2">
                        {isSearching ? (
                          <div className="p-4 text-center text-xs text-slate-400">Searching recipients...</div>
                        ) : searchResults?.data?.length ? (
                          searchResults.data.map((item) => (
                            <button
                              key={item._id}
                              type="button"
                              onClick={() => {
                                setSelectedRecipient(item);
                                setIsSearchOpen(false);
                              }}
                              className="w-full p-2.5 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-700/50 flex items-center justify-between transition-colors"
                            >
                              <div>
                                <div className="text-xs font-bold text-slate-900 dark:text-white">{item.name}</div>
                                <div className="text-[11px] text-slate-500">{item.phone}</div>
                              </div>
                              <div>
                                {item.hasPushToken ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                    Token Ready
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-500">
                                    No Token
                                  </span>
                                )}
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="p-4 text-center text-xs text-slate-400">No matching recipients found</div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Notification Title */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  Notification Title
                  <span className="text-rose-500">*</span>
                </label>
                <span className="text-xs text-slate-400">{title.length}/200</span>
              </div>
              <input
                type="text"
                required
                maxLength={200}
                placeholder="e.g. Special Offer Today! 🎁"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            {/* Notification Body */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  Message Body
                  <span className="text-rose-500">*</span>
                </label>
                <span className="text-xs text-slate-400">{body.length}/1000</span>
              </div>
              <textarea
                required
                rows={3}
                maxLength={1000}
                placeholder="Write your push notification message here..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              />
            </div>

            {/* Notification Config (Deep link + Priority + Sound) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
                  Action / Deep Link Screen
                </label>
                <select
                  value={screen}
                  onChange={(e) => setScreen(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="home">Home / Explore</option>
                  <option value="book-now">Booking Flow (Book Now)</option>
                  <option value="dashboard">Driver Dashboard</option>
                  <option value="active-ride">Active Ride Tracking</option>
                  <option value="bookings">Booking History</option>
                  <option value="offers">Offers & Promos</option>
                  <option value="profile">User Profile</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as "high" | "normal")}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="high">High (Immediate Heads-Up Banner)</option>
                  <option value="normal">Normal</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
                  Sound Alert
                </label>
                <select
                  value={sound}
                  onChange={(e) => setSound(e.target.value as "default" | "none")}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="default">Default Alert Chime 🔔</option>
                  <option value="none">Silent (No Sound)</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSending}
                className="w-full py-3.5 px-6 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
              >
                {isSending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Dispatching Push Notifications...</span>
                  </>
                ) : (
                  <>
                    <RiSendPlaneFill className="text-lg transition-transform group-hover:translate-x-1 group-hover:-translate-y-0.5" />
                    <span>Send Push to {estimatedReach.toLocaleString()} Device(s)</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Live Smartphone Device Mockup (4 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 sticky top-6">
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 p-6 rounded-3xl border border-slate-800 shadow-2xl text-white flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <RiSmartphoneLine className="text-primary text-xl" />
                <span className="font-bold text-sm text-white">Live Push Preview</span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full bg-white/10 text-slate-300">
                Lockscreen Banner
              </span>
            </div>

            {/* Smartphone Frame */}
            <div className="bg-slate-900/90 rounded-2xl border border-white/15 p-4 flex flex-col gap-4 shadow-inner">
              {/* Phone Status Bar */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                <span>9:41</span>
                <div className="flex items-center gap-1.5">
                  <span>5G</span>
                  <div className="w-5 h-2.5 border border-slate-400 rounded-sm p-0.5 flex items-center">
                    <div className="w-3 h-full bg-slate-400 rounded-2xs" />
                  </div>
                </div>
              </div>

              {/* Notification Card on Mockup */}
              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 flex flex-col gap-2 shadow-lg transition-all animate-fade-in">
                {/* Header inside Push */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-primary flex items-center justify-center font-black text-[10px] text-white">
                      H
                    </div>
                    <span className="text-xs font-bold text-white tracking-wide">
                      {targetAudience.includes("DRIVER") ? "HOLDIT DRIVER" : "HOLDIT"}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">now</span>
                </div>

                {/* Body Content */}
                <div className="flex flex-col gap-1">
                  <div className="text-sm font-bold text-white leading-tight">
                    {title || "Your Notification Title"}
                  </div>
                  <div className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                    {body || "This is how your message will appear on customer and driver lockscreens."}
                  </div>
                </div>

                {/* Target action tag */}
                <div className="mt-1 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Action: Open {screen}</span>
                  <span className="text-primary font-bold">Tap to open ›</span>
                </div>
              </div>
            </div>

            {/* Preview Footnote */}
            <div className="text-xs text-slate-400 flex items-start gap-2 bg-white/5 p-3 rounded-xl border border-white/5">
              <RiInformationLine className="text-base text-primary shrink-0 mt-0.5" />
              <span>
                Notification displays using system high-priority heads-up banners on iOS and Android devices with sound chime.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Push Audit History Table */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <RiHistoryLine className="text-primary" />
              Broadcast Logs & History
            </h2>
            <p className="text-xs text-slate-500 mt-1">Audit log of all manual push notifications sent by admins.</p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <RiSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input
              type="text"
              placeholder="Search logs..."
              value={historySearch}
              onChange={(e) => {
                setHistorySearch(e.target.value);
                setHistoryPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>

        {/* Table Content */}
        {isHistoryLoading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : historyData?.data?.logs?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
              <thead className="text-xs uppercase bg-slate-50/75 dark:bg-slate-900/50 text-slate-500 font-bold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3.5 rounded-l-xl">Notification Content</th>
                  <th className="px-4 py-3.5">Target Audience</th>
                  <th className="px-4 py-3.5">Recipients</th>
                  <th className="px-4 py-3.5">Target Screen</th>
                  <th className="px-4 py-3.5">Sent By</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 rounded-r-xl">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {historyData.data.logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="px-4 py-3.5 max-w-xs">
                      <div className="font-bold text-slate-900 dark:text-white truncate">{log.title}</div>
                      <div className="text-xs text-slate-500 truncate mt-0.5">{log.body}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {log.targetAudience}
                      </span>
                      {log.targetRecipientName && (
                        <div className="text-[11px] text-primary font-bold mt-1">
                          👤 {log.targetRecipientName}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                      {log.recipientCount.toLocaleString()} devices
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded-lg text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {log.screen}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-xs font-bold text-slate-900 dark:text-white">{log.sentByName}</div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">{log.sentByRole}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      {log.status === "COMPLETED" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          <FaCheckCircle className="text-[10px]" /> Sent
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400">
                          <FaTimesCircle className="text-[10px]" /> Failed
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">
                      {new Date(log.createdAt).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {historyData.data.pagination.totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={historyPage}
                  totalPages={historyData.data.pagination.totalPages}
                  onPageChange={(p) => setHistoryPage(p)}
                />
              </div>
            )}
          </div>
        ) : (
          <NoData
            title="No Push Notifications Sent Yet"
          />
        )}
      </div>
    </div>
  );
}
