"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  useGetBookingQuery,
  useGetBookingsQuery,
  useCancelBookingMutation,
  useAssignDriverMutation,
  useReassignDriverMutation,
  useProcessCriticalCancelMutation,
  useMarkArrivedMutation,
  useMarkPickedUpMutation,
  useMarkStoredMutation,
  useRequestReturnMutation,
  useAssignReturnDriverMutation,
  useMarkDeliveredMutation,
  useRegenerateStatementMutation,
  useGetBookingFinancialsQuery,
} from "../../../../services/bookingApi";
import {
  useApplyBookingCouponMutation,
  useRemoveBookingCouponMutation,
  useGetCoupansQuery,
  useGetUserCouponsQuery,
} from "../../../../services/coupan.Api";
import { useGetDriversQuery } from "../../../../services/driverApi";
import { useToast } from "../../../../hooks/useToast";
import { RoleGuard } from "../../../../components/common/RoleGuard";
import { DetailsPageSkeleton } from "../../../../components/common/Skeleton";
import {
  FaArrowLeft,
  FaBoxOpen,
  FaClipboardList,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaStore,
  FaTruck,
  FaUser,
  FaUserTie,
  FaClock,
  FaSyncAlt,
  FaCamera,
  FaFileInvoiceDollar,
  FaKey,
  FaBroadcastTower,
  FaHistory,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaSearch,
  FaTimes,
  FaRobot,
  FaCheck,
  FaPhone,
  FaMotorcycle,
  FaCar,
  FaInfoCircle,
  FaBolt,
  FaImages,
  FaExpand,
  FaExternalLinkAlt,
  FaUserPlus,
  FaExchangeAlt,
  FaWarehouse,
  FaLuggageCart,
  FaTruckLoading,
  FaStar,
  FaRegStar,
  FaQuoteLeft,
  FaTag,
  FaTrashAlt,
  FaPercent,
} from "react-icons/fa";
import { Booking, PopulatedUser, PopulatedStore, TimelineEntry, BookingReview } from "@/app/types/booking";
import { getCurrencySymbol } from "@/app/utils/helper";

// ── Tabs ──
const TABS = [
  { key: "booking", label: "Booking Details", icon: <FaClipboardList /> },
  { key: "financials", label: "Financials & Invoices", icon: <FaMoneyBillWave /> },
  { key: "photos", label: "Luggage Photos", icon: <FaImages /> },
  { key: "user", label: "User Details", icon: <FaUser /> },
  { key: "store", label: "Store Details", icon: <FaStore /> },
  { key: "driver", label: "Driver Details", icon: <FaTruck /> },
  { key: "timeline", label: "Booking Timeline", icon: <FaClock /> },
  { key: "reviews", label: "Reviews & Feedback", icon: <FaStar /> },
] as const;

type TabKey = (typeof TABS)[number]["key"];

// ── Helpers ──
const getUserName = (booking: any): string => {
  const userId = booking?.userId;
  const userInfo = booking?.userInfo;
  if (typeof userId === "object" && userId) {
    const fullName = `${userId.first_name || ""} ${userId.last_name || ""}`.trim();
    if (fullName) return fullName;
  }
  if (userInfo) {
    const fullName = `${userInfo.firstName || ""} ${userInfo.lastName || ""}`.trim();
    if (fullName) return fullName;
    if (userInfo.phone) return userInfo.phone;
  }
  if (typeof userId === "object" && userId) {
    return userId.phone || userId.email || userId._id || "Customer";
  }
  if (typeof userId === "string") return userId;
  return "—";
};

const getUserField = (booking: any, field: keyof PopulatedUser): string => {
  const userId = booking?.userId;
  const userInfo = booking?.userInfo;
  if (typeof userId === "object" && userId && (userId as any)[field]) {
    return String((userId as any)[field]);
  }
  if (userInfo) {
    if (field === "first_name" && userInfo.firstName) return userInfo.firstName;
    if (field === "last_name" && userInfo.lastName) return userInfo.lastName;
    if (field === "phone" && userInfo.phone) return userInfo.phone;
  }
  return "—";
};

const getServiceAreaName = (serviceAreaId: any): string => {
  if (!serviceAreaId) return "—";
  if (typeof serviceAreaId === "object") {
    return `${serviceAreaId.name || ""} ${serviceAreaId.city ? `(${serviceAreaId.city})` : ""}`.trim();
  }
  return String(serviceAreaId);
};

const getStoreName = (storeId: Booking["storeId"]): string => {
  if (!storeId) return "Not assigned";
  if (typeof storeId === "string") return storeId;
  return (storeId as PopulatedStore)?.store_name || "—";
};

const getStoreField = (storeId: Booking["storeId"], field: keyof PopulatedStore): string => {
  if (!storeId || typeof storeId === "string") return "—";
  return String((storeId as PopulatedStore)?.[field] || "—");
};

const getDriverName = (assignment?: any): string => {
  if (!assignment?.driverId) return "Not assigned";
  const d = assignment.driverId;
  if (typeof d === "string") return `Driver (${d.slice(-6)})`;
  return `${d.first_name || ""} ${d.last_name || ""}`.trim() || "Driver";
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

const resolveImgUrl = (path?: string | null): string => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const base =
    process.env.NEXT_PUBLIC_SOCKET_URL ||
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, "") ||
    (typeof window !== "undefined" ? window.location.origin : "");
  return `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
};

// ── Status Badge Map ──
const STATUS_BADGE: Record<string, { label: string; color: string }> = {
  created: { label: "Created", color: "bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400" },
  payment_pending: { label: "Advance Payment Pending", color: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400" },
  store_assigned: { label: "Store Assigned", color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400" },
  driver_assigned: { label: "Driver Assigned", color: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400" },
  driver_arrived: { label: "Driver Arrived", color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400" },
  picked_up: { label: "Picked Up", color: "bg-teal-100 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400" },
  at_store: { label: "At Store Hub", color: "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400" },
  stored: { label: "Stored in Vault", color: "bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400" },
  return_requested: { label: "Return Requested", color: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400" },
  final_payment_pending: { label: "Final Payment Pending", color: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400" },
  final_payment_captured: { label: "Final Payment Captured", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" },
  return_driver_assigned: { label: "Return Driver Assigned", color: "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400" },
  out_for_return: { label: "Out for Return", color: "bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400" },
  arrived_for_delivery: { label: "Arrived for Delivery", color: "bg-lime-100 text-lime-700 dark:bg-lime-500/10 dark:text-lime-400" },
  delivered: { label: "Delivered & Completed", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400" },
  driver_cancelled_critical: { label: "Driver Cancelled (Critical)", color: "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400" },
};

// ── Reusable Components ──
const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex justify-between items-start py-3 border-b border-slate-100 dark:border-slate-700/30 last:border-0">
    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider shrink-0">{label}</span>
    <span className="text-sm font-medium text-slate-900 dark:text-white text-right max-w-[65%] break-words">{value || "—"}</span>
  </div>
);

const SectionCard = ({ title, icon, children }: { title?: string; icon?: React.ReactNode; children: React.ReactNode }) => (
  <div className="bg-white dark:bg-[#1a2332] rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm overflow-hidden">
    {title && (
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700/30 flex items-center gap-2">
        {icon && <span className="text-primary text-sm">{icon}</span>}
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">{title}</h3>
      </div>
    )}
    <div className="px-6 py-4">{children}</div>
  </div>
);

const OtpBadge = ({ otp, label, color }: { otp?: string; label: string; color: string }) => {
  if (!otp) return null;
  return (
    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/30">
      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">{label}</p>
      <div className="flex items-center gap-2">
        {otp.split("").map((digit, i) => (
          <div
            key={i}
            className={`w-10 h-12 rounded-xl ${color} flex items-center justify-center shadow-sm`}
          >
            <span className="text-2xl font-black font-mono">{digit}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Master OTP Center Component ──
const MasterOtpCard = ({ booking }: { booking: any }) => {
  const otps = booking.otps || {};
  const pickupOtp = otps.pickupOtp || booking.pickup?.assignment?.otp || booking.otp;
  const storageOtp = otps.storageOtp || booking.pickup?.assignment?.storageOtp;
  const storageReturnOtp = otps.storageReturnOtp || booking.delivery?.assignment?.storageReturnOtp;
  const returnOtp = otps.returnOtp || booking.delivery?.assignment?.returnOtp;

  const otpList = [
    {
      title: "Pickup Security PIN",
      subtitle: "Customer ➔ Pickup Driver",
      otp: pickupOtp,
      color: "bg-blue-50/70 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20",
      badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
      description: "Driver enters this OTP in app to confirm luggage pickup from customer.",
    },
    {
      title: "Storage Hub Inward PIN",
      subtitle: "Pickup Driver ➔ Store Hub",
      otp: storageOtp,
      color: "bg-purple-50/70 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/20",
      badgeColor: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300",
      description: "Store manager enters this OTP to verify luggage check-in at the storage hub.",
    },
    {
      title: "Store Return Release PIN",
      subtitle: "Return Driver ➔ Store Hub",
      otp: storageReturnOtp,
      color: "bg-amber-50/70 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20",
      badgeColor: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
      description: "Store manager enters this OTP to release luggage to the return delivery partner.",
    },
    {
      title: "Return Delivery PIN",
      subtitle: "Customer ➔ Return Driver",
      otp: returnOtp,
      color: "bg-emerald-50/70 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20",
      badgeColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
      description: "Driver enters this OTP in app upon handing over luggage back to customer.",
    },
  ];

  return (
    <SectionCard title="Master OTP Verification & Security Center" icon={<FaKey />}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {otpList.map((item, idx) => (
          <div key={idx} className={`p-4 rounded-2xl border ${item.color} flex flex-col justify-between`}>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold uppercase tracking-wider">{item.title}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                  {item.subtitle}
                </span>
              </div>
              <p className="text-[11px] opacity-75 mb-3">{item.description}</p>
            </div>
            {item.otp ? (
              <div className="flex items-center gap-1.5 pt-2">
                {String(item.otp).split("").map((digit, i) => (
                  <div
                    key={i}
                    className="w-9 h-11 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center"
                  >
                    <span className="text-xl font-black font-mono">{digit}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-2 text-xs opacity-50 italic">Not generated yet (Pending workflow step)</div>
            )}
          </div>
        ))}
      </div>
    </SectionCard>
  );
};

// ── Live Driver Dispatch & Offer Radar Component ──
const LiveDriverDispatchCard = ({ booking }: { booking: any }) => {
  const dispatch = booking.dispatchInfo || {};
  const isReturnPhase = ["stored", "in_storage", "final_payment_pending", "final_payment_captured", "return_requested", "return_driver_assigned", "out_for_return", "arrived_for_delivery", "delivered"].includes(booking.status);
  const searchStatus = isReturnPhase ? (booking.delivery?.driverSearchStatus || "idle") : (booking.pickup?.driverSearchStatus || "idle");
  const activeOffer = dispatch.activeOffer;
  const triedDrivers = dispatch.triedDrivers || [];
  const candidateDrivers = dispatch.remainingCandidates || [];

  return (
    <SectionCard title="Live Driver Dispatch & Offer Radar" icon={<FaBroadcastTower />}>
      {/* Live Dispatch Radar Status */}
      <div className="mb-4 pb-4 border-b border-slate-100 dark:border-slate-700/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            searchStatus === "searching" ? "bg-amber-100 dark:bg-amber-500/10 text-amber-600 animate-pulse" :
            searchStatus === "assigned" ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600" :
            searchStatus === "failed" ? "bg-rose-100 dark:bg-rose-500/10 text-rose-600" :
            "bg-slate-100 dark:bg-slate-800 text-slate-500"
          }`}>
            <FaBroadcastTower className="text-lg" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                {isReturnPhase ? "Return Leg Dispatch" : "Pickup Leg Dispatch"}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                searchStatus === "searching" ? "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400" :
                searchStatus === "assigned" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" :
                searchStatus === "failed" ? "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400" :
                "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
              }`}>
                {searchStatus}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {searchStatus === "searching" ? "System is currently matching nearby drivers..." :
               searchStatus === "assigned" ? "Driver successfully assigned and confirmed" :
               searchStatus === "failed" ? "No nearby drivers were available (can retry search)" :
               "Dispatch search idle"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500">Candidates in Radius:</span>
          <span className="font-bold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white font-mono">
            {dispatch.remainingCount ?? candidateDrivers.length}
          </span>
        </div>
      </div>

      {/* Currently Offered Driver */}
      <div className="mb-4">
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          Currently Offered Driver (Pending Response)
        </p>
        {activeOffer?.driver ? (
          <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-200 dark:bg-amber-500/20 flex items-center justify-center font-bold text-amber-800 dark:text-amber-300">
                {activeOffer.driver.first_name?.charAt(0) || "D"}
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">
                  {`${activeOffer.driver.first_name || ""} ${activeOffer.driver.last_name || ""}`.trim() || "Driver"}
                </p>
                <p className="text-slate-500 dark:text-slate-400">{activeOffer.driver.phone || "—"}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-slate-600 dark:text-slate-300">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Attempt</span>
                <span className="font-bold">#{activeOffer.attemptNumber || 1}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Vehicle</span>
                <span className="font-bold">{activeOffer.driver.vehicle_details?.model || activeOffer.driver.vehicle_details?.vehicle_number || "—"}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Offered At</span>
                <span className="font-medium">{formatDate(activeOffer.offeredAt)}</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic py-2 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl">
            No live pending offer popup active right now.
          </p>
        )}
      </div>

      {/* Tried Drivers / Offer History */}
      <div>
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
          <FaHistory className="text-slate-400" />
          Driver Offers Sent / Declined History ({triedDrivers.length})
        </p>
        {triedDrivers.length > 0 ? (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {triedDrivers.map((driver: any, idx: number) => (
              <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/40 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] font-mono text-slate-400 w-4">#{idx + 1}</span>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">
                      {`${driver.first_name || ""} ${driver.last_name || ""}`.trim() || "Driver"}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{driver.phone || "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 text-[11px]">
                    {driver.vehicle_details?.model || driver.vehicle_details?.vehicle_number || "—"}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    DECLINED / TIMED OUT
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic py-2 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl">
            No previous driver declines or timeouts recorded for this booking.
          </p>
        )}
      </div>
    </SectionCard>
  );
};

// ═══════════════════════════════════════════
//  COUPON MANAGEMENT CARD & MODAL
// ═══════════════════════════════════════════
const CouponManagementCard = ({ booking }: { booking: any }) => {
  const toast = useToast();
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [selectedCoupon, setSelectedCoupon] = useState<any>(null);
  const [filterTab, setFilterTab] = useState<"all" | "public" | "assigned">("all");

  const [applyBookingCoupon, { isLoading: isApplying }] = useApplyBookingCouponMutation();
  const [removeBookingCoupon, { isLoading: isRemoving }] = useRemoveBookingCouponMutation();

  const { data: couponsData, isLoading: isLoadingCoupons } = useGetCoupansQuery(
    { page: 1, limit: 100, isActive: true },
    { skip: !showApplyModal }
  );

  const rawCoupons = couponsData?.data?.coupons || couponsData?.data || [];
  const currency = booking.pricing?.currency || booking.pricing?.pricingSnapshot?.currency || "INR";
  const sym = getCurrencySymbol(currency);

  const orderAmount =
    booking.pricing?.totalAmount ||
    booking.pricing?.advanceAmount ||
    booking.pricing?.advanceBreakdown?.totalAmount ||
    0;

  const appliedCoupon = booking.coupon && !booking.coupon.removedAt ? booking.coupon : null;

  // Filter coupons for modal
  const filteredCoupons = useMemo(() => {
    return rawCoupons.filter((c: any) => {
      if (!c.isActive) return false;
      const now = new Date();
      if (c.startsAt && new Date(c.startsAt) > now) return false;
      if (c.expiresAt && new Date(c.expiresAt) < now) return false;
      if (c.usageLimit !== null && c.usageCount >= c.usageLimit) return false;

      if (filterTab === "public" && c.scope !== "PUBLIC") return false;
      if (filterTab === "assigned" && c.scope !== "ASSIGNED") return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const codeMatch = (c.code || "").toLowerCase().includes(q);
        const nameMatch = (c.name || "").toLowerCase().includes(q);
        const descMatch = (c.description || "").toLowerCase().includes(q);
        return codeMatch || nameMatch || descMatch;
      }
      return true;
    });
  }, [rawCoupons, searchQuery, filterTab]);

  const advBreakdown = booking.pricing?.advanceBreakdown || {};
  const retBreakdown = booking.pricing?.returnBreakdown || {};
  const advanceAmount = Number(booking.pricing?.advanceAmount || advBreakdown.totalAmount || 0);
  const returnAmount = Number(retBreakdown.totalAmount || 0);
  const totalBookingAmount = (advanceAmount + returnAmount) || orderAmount;

  // Compute preview split discount
  const previewSplit = useMemo(() => {
    if (!selectedCoupon) {
      return { advanceDiscount: 0, finalDiscount: 0, remainingDiscount: 0, totalDiscount: 0 };
    }
    const val = Number(selectedCoupon.discountValue || 0);
    if (selectedCoupon.discountType === "FIXED") {
      const advDisc = Math.min(advanceAmount, val);
      const rem = Math.max(0, val - advDisc);
      const finDisc = Math.min(returnAmount, rem);
      return {
        advanceDiscount: advDisc,
        finalDiscount: finDisc,
        remainingDiscount: rem,
        totalDiscount: advDisc + finDisc,
      };
    } else {
      const pct = Math.min(100, Math.max(0, val));
      const rawAdv = (advanceAmount * pct) / 100;
      const advDisc = selectedCoupon.maxDiscount ? Math.min(advanceAmount, Math.min(rawAdv, selectedCoupon.maxDiscount)) : Math.min(advanceAmount, rawAdv);
      const rawFin = (returnAmount * pct) / 100;
      const finDisc = selectedCoupon.maxDiscount ? Math.min(returnAmount, Math.min(rawFin, Math.max(0, selectedCoupon.maxDiscount - advDisc))) : Math.min(returnAmount, rawFin);
      return {
        advanceDiscount: advDisc,
        finalDiscount: finDisc,
        remainingDiscount: 0,
        totalDiscount: advDisc + finDisc,
      };
    }
  }, [selectedCoupon, advanceAmount, returnAmount]);

  // Apply Handler
  const handleApply = async () => {
    const codeToApply = (selectedCoupon?.code || customCode).trim().toUpperCase();
    if (!codeToApply && !selectedCoupon?._id) {
      toast.error("Please select a coupon or enter a coupon code");
      return;
    }

    try {
      const res = await applyBookingCoupon({
        bookingId: booking._id,
        couponId: selectedCoupon?._id,
        couponCode: codeToApply || undefined,
      }).unwrap();

      toast.success(res?.message || "Coupon applied to booking successfully!");
      setShowApplyModal(false);
      setSelectedCoupon(null);
      setCustomCode("");
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to apply coupon");
    }
  };

  // Remove Handler
  const handleRemove = async () => {
    try {
      const res = await removeBookingCoupon(booking._id).unwrap();
      toast.success(res?.message || "Coupon removed from booking successfully!");
      setShowRemoveModal(false);
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to remove coupon");
    }
  };

  return (
    <SectionCard title="Coupon & Promotions Management" icon={<FaTag />}>
      {appliedCoupon ? (
        <div className="space-y-4">
          {/* Active Applied Coupon Card */}
          <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-base font-black px-3 py-1 bg-emerald-600 text-white rounded-lg tracking-wider shadow-sm flex items-center gap-1.5">
                    <FaTag className="text-xs" /> {appliedCoupon.code}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                    {appliedCoupon.discountType === "PERCENTAGE"
                      ? `${appliedCoupon.discountValue}% OFF`
                      : `${sym}${appliedCoupon.discountValue} OFF`}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Active on Order
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Applied by{" "}
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {appliedCoupon.appliedByModel || "Admin"}
                  </span>
                  {appliedCoupon.appliedAt && ` • ${formatDate(appliedCoupon.appliedAt)}`}
                </p>
              </div>

              {/* Discount Amount Saved */}
              <div className="text-left sm:text-right">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Discount Savings</span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  -{sym}{(appliedCoupon.discountAmount || 0).toFixed(2)}
                </span>
                <div className="text-[11px] text-slate-500 space-y-0.5 mt-1">
                  <p>Advance: <strong className="text-emerald-600">-{sym}{(appliedCoupon.advanceDiscount || appliedCoupon.discountAmount || 0).toFixed(2)}</strong></p>
                  {appliedCoupon.discountType === "FIXED" ? (
                    <p>
                      Final Phase:{" "}
                      <strong className="text-emerald-600">
                        {appliedCoupon.finalDiscount
                          ? `-${sym}${appliedCoupon.finalDiscount.toFixed(2)}`
                          : appliedCoupon.remainingDiscount
                          ? `${sym}${appliedCoupon.remainingDiscount.toFixed(2)} to reduce on return`
                          : "Fully absorbed in advance"}
                      </strong>
                    </p>
                  ) : (
                    <p>Final Phase: <strong className="text-emerald-600">{appliedCoupon.discountValue}% off return</strong></p>
                  )}
                </div>
              </div>
            </div>

            {/* Remove Action */}
            <div className="mt-4 pt-3 border-t border-emerald-200/50 dark:border-emerald-500/20 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Order Total after discount:{" "}
                <strong className="text-slate-900 dark:text-white">
                  {sym}{Math.max(0, orderAmount - (appliedCoupon.discountAmount || 0)).toFixed(2)}
                </strong>
              </span>
              <button
                type="button"
                onClick={() => setShowRemoveModal(true)}
                className="px-3 py-1.5 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <FaTrashAlt className="text-xs" /> Remove Coupon
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-6 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 text-xl">
            <FaTag />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">No Coupon Applied</h4>
            <p className="text-xs text-slate-500 max-w-sm mt-0.5">
              Apply a promo code or an assigned customer coupon directly to this booking to grant a discount.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedCoupon(null);
              setCustomCode("");
              setSearchQuery("");
              setShowApplyModal(true);
            }}
            className="px-4 py-2 bg-primary hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer mt-2"
          >
            <FaTag className="text-xs" /> Apply Coupon
          </button>
        </div>
      )}

      {/* ── APPLY COUPON MODAL ── */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1a2332] w-full max-w-xl rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FaTag className="text-primary" /> Apply Coupon to Booking
                </h3>
                <p className="text-xs text-slate-500">
                  Booking #{booking.bookingCode || booking._id?.slice(-6)} • Order Value:{" "}
                  <strong className="text-slate-900 dark:text-white">{sym}{orderAmount.toFixed(2)}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowApplyModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Manual Code Input */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  Enter Coupon Code Directly
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <FaTag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                    <input
                      type="text"
                      placeholder="e.g. SUMMER50, SAVE20"
                      value={customCode}
                      onChange={(e) => {
                        setCustomCode(e.target.value.toUpperCase());
                        setSelectedCoupon(null);
                      }}
                      className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#121824] border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold tracking-wider text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary uppercase"
                    />
                  </div>
                  {customCode && (
                    <button
                      type="button"
                      onClick={() => setCustomCode("")}
                      className="px-3 py-2 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-600 cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Or Select Available Coupons */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Or Select Active Coupon
                  </span>
                  {/* Filter tabs */}
                  <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setFilterTab("all")}
                      className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                        filterTab === "all" ? "bg-white dark:bg-slate-700 text-primary shadow-xs" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterTab("public")}
                      className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                        filterTab === "public" ? "bg-white dark:bg-slate-700 text-primary shadow-xs" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      Public
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterTab("assigned")}
                      className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                        filterTab === "assigned" ? "bg-white dark:bg-slate-700 text-primary shadow-xs" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      Assigned
                    </button>
                  </div>
                </div>

                {/* Search Box */}
                <div className="relative">
                  <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                  <input
                    type="text"
                    placeholder="Search by code, name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#121824] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* List of Coupons */}
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {isLoadingCoupons ? (
                    <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                      <FaSyncAlt className="animate-spin text-primary" /> Loading active coupons...
                    </div>
                  ) : filteredCoupons.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      No active coupons matching the criteria.
                    </div>
                  ) : (
                    filteredCoupons.map((c: any) => {
                      const isSelected = selectedCoupon?._id === c._id;
                      const isMinOrderMet = !c.minOrderValue || orderAmount >= c.minOrderValue;

                      return (
                        <div
                          key={c._id}
                          onClick={() => {
                            setSelectedCoupon(c);
                            setCustomCode("");
                          }}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                            isSelected
                              ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                              : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-[#121824]"
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-black text-slate-900 dark:text-white">
                                {c.code}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary">
                                {c.discountType === "PERCENTAGE"
                                  ? `${c.discountValue}% OFF`
                                  : `${sym}${c.discountValue} OFF`}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                c.scope === "ASSIGNED"
                                  ? "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300"
                                  : "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300"
                              }`}>
                                {c.scope || "PUBLIC"}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 truncate max-w-xs">{c.name || c.description}</p>
                            <div className="flex items-center gap-3 text-[10px] text-slate-400">
                              {c.minOrderValue ? (
                                <span className={!isMinOrderMet ? "text-amber-500 font-bold" : ""}>
                                  Min Order: {sym}{c.minOrderValue} {!isMinOrderMet && "(Not met)"}
                                </span>
                              ) : (
                                <span>No min order</span>
                              )}
                              {c.expiresAt && (
                                <span>Expires: {new Date(c.expiresAt).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>

                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ml-3 ${
                            isSelected ? "border-primary bg-primary text-white" : "border-slate-300 dark:border-slate-600"
                          }`}>
                            {isSelected && <FaCheck className="text-[8px]" />}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Discount Preview Calculation */}
              {(selectedCoupon || customCode) && (
                <div className="bg-emerald-50 dark:bg-emerald-500/10 p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-500/20 space-y-2">
                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                    <span>Order Total (Advance + Return):</span>
                    <span className="font-semibold">{sym}{totalBookingAmount.toFixed(2)}</span>
                  </div>
                  {selectedCoupon && (
                    <>
                      <div className="flex justify-between text-xs text-emerald-700 dark:text-emerald-400 font-bold">
                        <span>Total Calculated Discount ({selectedCoupon.code}):</span>
                        <span>-{sym}{previewSplit.totalDiscount.toFixed(2)}</span>
                      </div>
                      <div className="bg-white/70 dark:bg-slate-800/70 p-2.5 rounded-xl space-y-1 text-[11px] text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700/50">
                        <div className="flex justify-between">
                          <span>• Advance Payment Discount:</span>
                          <span className="font-semibold text-emerald-600">-{sym}{previewSplit.advanceDiscount.toFixed(2)}</span>
                        </div>
                        {selectedCoupon.discountType === "FIXED" ? (
                          <div className="flex justify-between">
                            <span>• Return Final Reduction:</span>
                            <span className="font-semibold text-emerald-600">
                              {previewSplit.remainingDiscount > 0
                                ? `-${sym}${previewSplit.remainingDiscount.toFixed(2)} (reduces return bill)`
                                : `₹0.00 (absorbed in advance)`}
                            </span>
                          </div>
                        ) : (
                          <div className="flex justify-between">
                            <span>• Return Final Reduction:</span>
                            <span className="font-semibold text-emerald-600">
                              {selectedCoupon.discountValue}% applied to return bill
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-between text-xs font-black text-slate-900 dark:text-white pt-2 border-t border-emerald-200 dark:border-emerald-500/20">
                        <span>Net Order Total:</span>
                        <span className="text-emerald-600 dark:text-emerald-400">
                          {sym}{Math.max(0, totalBookingAmount - previewSplit.totalDiscount).toFixed(2)}
                        </span>
                      </div>
                    </>
                  )}
                  {customCode && !selectedCoupon && (
                    <div className="flex justify-between text-xs text-emerald-700 dark:text-emerald-400 font-bold">
                      <span>Direct Coupon Code:</span>
                      <span>{customCode} (split calculated on apply)</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-800/40">
              <button
                type="button"
                onClick={() => setShowApplyModal(false)}
                disabled={isApplying}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleApply}
                disabled={isApplying || (!selectedCoupon && !customCode)}
                className="px-5 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm cursor-pointer"
              >
                {isApplying ? (
                  <>
                    <FaSyncAlt className="animate-spin text-xs" /> Applying Coupon...
                  </>
                ) : (
                  <>
                    <FaTag className="text-xs" /> Apply Discount to Order
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── REMOVE CONFIRMATION MODAL ── */}
      {showRemoveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1a2332] w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center text-xl mx-auto">
              <FaTrashAlt />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Remove Coupon from Booking?
              </h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to remove coupon{" "}
                <span className="font-mono font-bold text-rose-600">{appliedCoupon?.code}</span>? The discount of{" "}
                <strong className="text-slate-900 dark:text-white">
                  {sym}{(appliedCoupon?.discountAmount || 0).toFixed(2)}
                </strong>{" "}
                will be reversed from this order.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRemoveModal(false)}
                disabled={isRemoving}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRemove}
                disabled={isRemoving}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                {isRemoving ? (
                  <>
                    <FaSyncAlt className="animate-spin text-xs" /> Removing...
                  </>
                ) : (
                  <>
                    <FaTrashAlt className="text-xs" /> Yes, Remove Coupon
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </SectionCard>
  );
};

// ═══════════════════════════════════════════
//  TAB 1: BOOKING DETAILS TAB
// ═══════════════════════════════════════════
const BookingDetailsTab = ({ booking }: { booking: any }) => {
  const statusCfg = STATUS_BADGE[booking.status] || { label: booking.status, color: "bg-slate-100 text-slate-700" };
  const currency = booking.pricing?.currency || booking.pricing?.pricingSnapshot?.currency || "INR";
  const sym = getCurrencySymbol(currency);
  const advBreakdown = booking.pricing?.advanceBreakdown || {};
  const retBreakdown = booking.pricing?.returnBreakdown || {};

  return (
    <div className="space-y-6">
      {/* Master OTP Verification Center */}
      <MasterOtpCard booking={booking} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Info */}
        <SectionCard title="General Information" icon={<FaClipboardList />}>
          <DetailRow label="Booking Code" value={<span className="font-mono font-bold text-primary">{booking.bookingCode}</span>} />
          <DetailRow label="Service Area" value={getServiceAreaName(booking.serviceAreaId)} />
          <DetailRow label="Status" value={
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusCfg.color}`}>{statusCfg.label}</span>
          } />
          <DetailRow label="Created At" value={formatDate(booking.createdAt)} />
          <DetailRow label="Updated At" value={formatDate(booking.updatedAt)} />
          {booking.cancellation_reason && (
            <DetailRow label="Cancellation Reason" value={<span className="text-rose-600 font-semibold">{booking.cancellation_reason}</span>} />
          )}
          {booking.cancelReason && (
            <DetailRow label="Cancel Reason" value={<span className="text-rose-600 font-semibold">{booking.cancelReason}</span>} />
          )}
          {booking.notes && <DetailRow label="Notes" value={booking.notes} />}
        </SectionCard>

        {/* Luggage Info */}
        <SectionCard title="Luggage & Item Breakdown" icon={<FaBoxOpen />}>
          {booking.luggage ? (
            <>
              <DetailRow label="Total Items" value={
                <span className="text-lg font-extrabold text-primary">{booking.luggage.totalCount} bags</span>
              } />
              <DetailRow label="Small Bags" value={booking.luggage.small ?? 0} />
              <DetailRow label="Medium Bags" value={booking.luggage.medium ?? 0} />
              <DetailRow label="Large Bags" value={booking.luggage.large ?? 0} />
              {booking.luggage.other > 0 && <DetailRow label="Other / Bulky Items" value={booking.luggage.other} />}
            </>
          ) : (
            <p className="text-xs text-slate-400 py-2">No luggage information available</p>
          )}
        </SectionCard>

        {/* Locations */}
        <SectionCard title="Pickup Location" icon={<FaMapMarkerAlt />}>
          <DetailRow label="Address" value={booking.pickupLocation?.address || "—"} />
          {booking.pickupLocation && (
            <DetailRow label="Coordinates" value={`${booking.pickupLocation.lat}, ${booking.pickupLocation.lng}`} />
          )}
        </SectionCard>

        <SectionCard title="Delivery Location" icon={<FaMapMarkerAlt />}>
          {booking.deliveryLocation ? (
            <>
              <DetailRow label="Address" value={booking.deliveryLocation.address || "—"} />
              <DetailRow label="Coordinates" value={`${booking.deliveryLocation.lat}, ${booking.deliveryLocation.lng}`} />
            </>
          ) : (
            <p className="text-xs text-slate-400 py-2">Delivery location not set yet (Customer will provide at return request)</p>
          )}
        </SectionCard>

        {/* Critical Handover Location */}
        {booking.criticalHandoverLocation && (
          <SectionCard title="Handover Location (Driver Cancelled)">
            <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 mb-2">
              Luggage was in custody/transit when driver cancelled. Driver search routes from this position.
            </p>
            <DetailRow label="Handover Address" value={booking.criticalHandoverLocation.address || "—"} />
            <DetailRow label="Coordinates" value={`${booking.criticalHandoverLocation.lat}, ${booking.criticalHandoverLocation.lng}`} />
          </SectionCard>
        )}

        {/* Pricing Breakdown */}
        <SectionCard title="Pricing & Payment Breakdown" icon={<FaMoneyBillWave />}>
          {booking.pricing ? (() => {
            const snapshot = booking.pricing.pricingSnapshot;
            const platformFee = snapshot?.platformFeeMinor ? snapshot.platformFeeMinor / 100 : (advBreakdown.platformFee ?? 0);
            const deliveryFee = advBreakdown.deliveryFee ?? booking.pricing.distanceCharge ?? 0;
            const handlingFee = snapshot?.handlingFeeMinor ? snapshot.handlingFeeMinor / 100 : (advBreakdown.handlingFee ?? 0);
            const packingFee = snapshot?.packingFeeMinor ? snapshot.packingFeeMinor / 100 : (advBreakdown.packingFee ?? 0);
            const taxAmount = advBreakdown.taxAmount ?? 0;

            const computedAdvanceTotal = platformFee + deliveryFee + handlingFee + packingFee + taxAmount;
            const advanceTotal = booking.pricing.advanceAmount || advBreakdown.totalAmount || computedAdvanceTotal;
            const displayTotalAmount = booking.pricing.totalAmount || booking.pricing.advanceAmount || advanceTotal;

            return (
              <>
                <DetailRow label="Total Booking Amount" value={
                  <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                    {sym}{displayTotalAmount > 0 ? displayTotalAmount.toFixed(2) : "0.00"}
                  </span>
                } />
                {booking.coupon && !booking.coupon.removedAt && (
                  <div className="bg-emerald-50 dark:bg-emerald-500/10 p-3 rounded-xl border border-emerald-200 dark:border-emerald-500/20 my-2 space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                        <FaTag className="text-[10px]" /> Applied Coupon ({booking.coupon.code})
                      </span>
                      <span className="font-extrabold text-emerald-700 dark:text-emerald-400">
                        -{sym}{(booking.coupon.discountAmount || 0).toFixed(2)}
                      </span>
                    </div>
                    {(booking.coupon.advanceDiscount !== undefined || booking.coupon.finalDiscount !== undefined || booking.coupon.remainingDiscount !== undefined) && (
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 space-y-0.5 pt-1 border-t border-emerald-200/50 dark:border-emerald-500/20">
                        <div className="flex justify-between">
                          <span>Advance Payment Reduction:</span>
                          <span className="font-semibold text-emerald-600">-{sym}{(booking.coupon.advanceDiscount || booking.coupon.discountAmount || 0).toFixed(2)}</span>
                        </div>
                        {booking.coupon.discountType === "FIXED" ? (
                          <div className="flex justify-between">
                            <span>Return Payment Reduction:</span>
                            <span className="font-semibold text-emerald-600">
                              {booking.coupon.finalDiscount
                                ? `-${sym}${booking.coupon.finalDiscount.toFixed(2)} (applied)`
                                : booking.coupon.remainingDiscount
                                ? `-${sym}${booking.coupon.remainingDiscount.toFixed(2)} (pending on return)`
                                : `₹0.00 (absorbed in advance)`}
                            </span>
                          </div>
                        ) : (
                          <div className="flex justify-between">
                            <span>Return Payment Reduction:</span>
                            <span className="font-semibold text-emerald-600">
                              {booking.coupon.finalDiscount
                                ? `-${sym}${booking.coupon.finalDiscount.toFixed(2)} (applied)`
                                : `${booking.coupon.discountValue}% applied on return`}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex justify-between items-center text-[11px] text-emerald-600 dark:text-emerald-400/80 pt-1 border-t border-emerald-200/50 dark:border-emerald-500/20">
                      <span>Net Total After Discount:</span>
                      <span className="font-bold">
                        {sym}{Math.max(0, displayTotalAmount - (booking.coupon.discountAmount || 0)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
                <DetailRow label="Per Hour Storage Rate" value={`${sym}${(booking.pricing.perHourRate ?? (snapshot?.customerStorageHourlyRateMinor ? snapshot.customerStorageHourlyRateMinor / 100 : 0)).toFixed(2)}`} />
                <DetailRow label="Distance Delivery Charge" value={`${sym}${deliveryFee.toFixed(2)}`} />
                
                {/* Advance Breakdown Sub-table */}
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/30 space-y-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phase 1: Advance Breakdown</p>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Platform Fee</span>
                      <span>{sym}{platformFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Delivery Fee</span>
                      <span>{sym}{deliveryFee.toFixed(2)}</span>
                    </div>
                    {handlingFee > 0 && (
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>Handling Fee</span>
                        <span>{sym}{handlingFee.toFixed(2)}</span>
                      </div>
                    )}
                    {packingFee > 0 && (
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>Packing Fee</span>
                        <span>{sym}{packingFee.toFixed(2)}</span>
                      </div>
                    )}
                    {taxAmount > 0 && (
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>GST / Taxes</span>
                        <span>{sym}{taxAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-700">
                      <span>Advance Total Paid</span>
                      <span>{sym}{advanceTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Return Breakdown Sub-table (if present) */}
                {(retBreakdown.totalAmount || retBreakdown.storageFee) && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/30 space-y-2">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phase 2: Return & Storage Final Breakdown</p>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>Storage Fee ({retBreakdown.billableHours || booking.pricing.storageHours || 0} hrs)</span>
                        <span>{sym}{(retBreakdown.storageFee || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>Return Delivery ({retBreakdown.returnDistanceKm || 0} km)</span>
                        <span>{sym}{(retBreakdown.deliveryFee || 0).toFixed(2)}</span>
                      </div>
                      {(retBreakdown.taxAmount || 0) > 0 && (
                        <div className="flex justify-between text-slate-600 dark:text-slate-400">
                          <span>Return GST</span>
                          <span>{sym}{(retBreakdown.taxAmount || 0).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-700">
                        <span>Return Total Amount</span>
                        <span>{sym}{(retBreakdown.totalAmount || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Gateway Status */}
                {booking.payment && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/30">
                    <DetailRow label="Payment Status" value={
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        booking.payment.status === "paid" || booking.payment.status === "captured"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                          : booking.payment.status === "failed"
                          ? "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                      }`}>
                        {(booking.payment.status || "pending").toUpperCase()}
                      </span>
                    } />
                    {booking.payment.paidAt && <DetailRow label="Paid At" value={formatDate(booking.payment.paidAt)} />}
                    {booking.payment.transactionId && <DetailRow label="Transaction ID" value={<span className="font-mono text-xs">{booking.payment.transactionId}</span>} />}
                  </div>
                )}

                {/* Payment Gateway Transactions list */}
                {booking.payments && booking.payments.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/30 space-y-2">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gateway Transactions ({booking.payments.length})</p>
                    <div className="space-y-2">
                      {booking.payments.map((p: any, idx: number) => (
                        <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl flex items-center justify-between text-xs">
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white uppercase">{p.type || p.phase || "Online"} Payment</p>
                            <p className="text-[10px] text-slate-400 font-mono">{p.razorpayPaymentId || p.razorpayOrderId || p._id}</p>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                              {sym}{((p.amountMinor || p.amount * 100 || 0) / 100).toFixed(2)}
                            </span>
                            <span className={`block text-[10px] font-bold uppercase ${p.status === "captured" ? "text-emerald-600" : "text-amber-500"}`}>
                              {p.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            );
          })() : (
            <p className="text-xs text-slate-400 py-2">No pricing breakdown calculated yet</p>
          )}
        </SectionCard>

        {/* Coupon & Discount Management Card */}
        <CouponManagementCard booking={booking} />
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════
//  TAB: FINANCIALS & SETTLEMENTS TAB
// ═══════════════════════════════════════════
const FinancialsTab = ({ booking }: { booking: any }) => {
  const { data: finData, isLoading, refetch } = useGetBookingFinancialsQuery(booking._id);
  const financials = finData?.data;

  if (isLoading) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
        <FaSyncAlt className="animate-spin text-primary text-2xl text-slate-400" />
        <p className="text-sm font-bold text-slate-500">Loading booking financials & settlements audit data...</p>
      </div>
    );
  }

  const invoices = financials?.invoices || [];
  const payments = financials?.payments || [];
  const earnings = financials?.earnings || [];
  const ledger = financials?.ledgerSummary;
  const pricingSnapshot = booking.pricing?.pricingSnapshot;
  const currency = financials?.currency || booking.pricing?.currency || pricingSnapshot?.currency || "INR";
  const sym = getCurrencySymbol(currency);

  const resolveDownloadUrl = (url?: string) => {
    if (!url) return "#";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, "") || (typeof window !== "undefined" ? window.location.origin : "");
    return `${base.replace(/\/$/, "")}${url.startsWith("/") ? url : `/${url}`}`;
  };

  const totalCustomerPaid = financials?.financialSummary?.totalCustomerPaid ?? payments
    .filter((p: any) => p.status === "CAPTURED" || p.status === "captured")
    .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

  const totalVendorPayout = financials?.financialSummary?.totalVendorPayout ?? earnings.reduce((sum: number, e: any) => sum + (e.netEarning || 0), 0);

  const platformRetention = financials?.financialSummary?.platformRetention ?? (
    totalCustomerPaid > 0
      ? Math.max(0, Number((totalCustomerPaid - totalVendorPayout).toFixed(2)))
      : earnings.reduce((sum: number, e: any) => sum + (e.commissionAmount || 0), 0)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Financial Metrics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#1a2332] p-5 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Customer Paid</p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {sym}{totalCustomerPaid.toFixed(2)}
          </p>
          <span className="text-[11px] text-slate-400">{payments.length} gateway payment(s)</span>
        </div>

        <div className="bg-white dark:bg-[#1a2332] p-5 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Vendors Payouts</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {sym}{totalVendorPayout.toFixed(2)}
          </p>
          <span className="text-[11px] text-slate-400">3 Vendors (Pickup + Store + Return)</span>
        </div>

        <div className="bg-white dark:bg-[#1a2332] p-5 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Platform Retention (Holdit)</p>
          <p className="text-2xl font-black text-primary mt-1">
            {sym}{platformRetention.toFixed(2)}
          </p>
          <span className="text-[11px] text-slate-400">Net margin after vendor payouts</span>
        </div>
      </div>

      {/* Coupon Notice in Financials (if active) */}
      {booking.coupon && !booking.coupon.removedAt && (
        <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm font-bold">
              <FaTag />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                Coupon Applied: <span className="font-mono text-emerald-600 dark:text-emerald-400">{booking.coupon.code}</span>
              </p>
              <p className="text-[11px] text-slate-500">
                Discount of {sym}{(booking.coupon.discountAmount || 0).toFixed(2)} applied to customer order
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
            {booking.coupon.discountType === "PERCENTAGE" ? `${booking.coupon.discountValue}% OFF` : `Fixed Discount`}
          </span>
        </div>
      )}

      {/* Pricing Rule Engine Card */}
      {pricingSnapshot && (
        <div className="bg-white dark:bg-[#1a2332] rounded-2xl border border-slate-200 dark:border-slate-700/50 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <FaFileInvoiceDollar className="text-primary" /> Active Pricing Rule Snapshot
              </h3>
              <p className="text-xs text-slate-500">Immutable rate rules applied when this booking was created</p>
            </div>
            <span className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-bold rounded-lg font-mono">
              {pricingSnapshot.currency || "INR"}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Customer Storage Rate</span>
              <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                {sym}{pricingSnapshot.customerStorageHourlyRateMinor ? (pricingSnapshot.customerStorageHourlyRateMinor / 100).toFixed(2) : "0.00"} / hr
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Min Chargeable Hours</span>
              <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                {pricingSnapshot.minimumChargeableHours || 1} hrs
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Peak Multiplier</span>
              <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                {pricingSnapshot.peakMultiplier || 1.0}x
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Tax Scheme</span>
              <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                {pricingSnapshot.taxMode || "EXCLUSIVE"} ({pricingSnapshot.taxRate || 18}%)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 1. Customer GST Tax Invoices */}
      <div className="bg-white dark:bg-[#1a2332] rounded-2xl border border-slate-200 dark:border-slate-700/50 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Customer GST Tax Invoices
            </h3>
            <p className="text-xs text-slate-500">Official itemized tax invoices delivered to customer</p>
          </div>
          <span className="px-2.5 py-1 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 text-xs font-bold rounded-lg">
            {invoices.length} Document(s)
          </span>
        </div>

        {invoices.length === 0 ? (
          <div className="p-6 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl text-slate-400 text-xs font-medium">
            No invoices generated yet for this booking.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {invoices.map((inv: any) => (
              <div key={inv.invoiceId} className="py-3.5 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                      {inv.invoiceNumber}
                    </span>
                    <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[10px] font-bold rounded">
                      {inv.phase === "PHASE_1" ? "Phase 1 (Advance)" : "Phase 2 (Final)"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Issued on {new Date(inv.issuedAt).toLocaleDateString()} • Subtotal: {sym}{inv.subtotal.toFixed(2)} + GST: {sym}{(inv.cgstAmount + inv.sgstAmount).toFixed(2)}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    {sym}{inv.totalAmount.toFixed(2)}
                  </span>
                  <a
                    href={resolveDownloadUrl(inv.downloadUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <FaExternalLinkAlt size={10} /> View Invoice
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Payment Gateway Records */}
      <div className="bg-white dark:bg-[#1a2332] rounded-2xl border border-slate-200 dark:border-slate-700/50 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          Payment Gateway Transactions
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="pb-2">Phase</th>
                <th className="pb-2">Gateway Order ID</th>
                <th className="pb-2">Payment ID</th>
                <th className="pb-2">Method</th>
                <th className="pb-2 text-right">Amount</th>
                <th className="pb-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {payments.map((p: any) => (
                <tr key={p.paymentId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-3 font-bold text-slate-800 dark:text-slate-200">
                    {p.phase === "PHASE_1" ? "Phase 1 (Advance)" : "Phase 2 (Final)"}
                  </td>
                  <td className="py-3 font-mono text-slate-500">{p.razorpayOrderId || "—"}</td>
                  <td className="py-3 font-mono text-slate-500">{p.razorpayPaymentId || "—"}</td>
                  <td className="py-3 text-slate-500 uppercase font-semibold">{p.method}</td>
                  <td className="py-3 text-right font-bold text-slate-900 dark:text-white">{sym}{p.amount.toFixed(2)}</td>
                  <td className="py-3 text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      p.status === "CAPTURED" || p.status === "captured" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                      p.status === "REFUNDED" || p.status === "refunded" ? "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" :
                      "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    }`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Vendor Earnings & Settlements (All 3 Vendors) */}
      <div className="bg-white dark:bg-[#1a2332] rounded-2xl border border-slate-200 dark:border-slate-700/50 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Vendor Earnings Breakdown & Statements
            </h3>
            <p className="text-xs text-slate-500">
              Complete payout accounting across 3 vendor legs: Pickup Driver, Storage Vault, and Return Delivery Driver
            </p>
          </div>
          <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs font-bold rounded-lg">
            3 Vendor Legs
          </span>
        </div>

        <div className="space-y-3">
          {earnings.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No vendor earnings created yet.</p>
          ) : (
            earnings.map((e: any, idx: number) => {
              const isPickup = e.purpose === "PICKUP" || e.purpose === "DOOR_PICKUP" || e.vendorOrder === 1;
              const isStorage = e.purpose === "STORAGE" || e.vendorOrder === 2;
              const isReturn = e.purpose === "RETURN_DELIVERY" || e.purpose === "DOOR_RETURN" || e.vendorOrder === 3;

              const vendorOrderText = e.roleLabel || (
                isPickup ? "1st Vendor: Pickup Driver (User → Store)" :
                isStorage ? "2nd Vendor: Storage Vault (Store Owner)" :
                "3rd Vendor: Return Driver (Store → User)"
              );

              const roleBadgeColor = isPickup
                ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                : isStorage
                ? "bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 border-violet-200 dark:border-violet-800"
                : "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800";

              return (
                <div key={e.earningId || idx} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl flex items-center justify-between gap-4 flex-wrap border border-slate-100 dark:border-slate-800/60 hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 text-[10px] font-extrabold uppercase rounded border ${roleBadgeColor}`}>
                        {vendorOrderText}
                      </span>
                      {e.isEstimate && (
                        <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-[10px] font-bold rounded">
                          ESTIMATE
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 pt-0.5">
                      <span className="font-bold text-slate-900 dark:text-white text-xs">
                        {e.recipientName}
                      </span>
                      <span className="text-slate-400 text-xs">({e.recipientType})</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Gross Fee: <span className="font-semibold text-slate-700 dark:text-slate-300">{sym}{e.grossAmount.toFixed(2)}</span> • Platform Commission: <span className="text-rose-500 font-semibold">-{sym}{e.commissionAmount.toFixed(2)}</span> • Settlement: <strong className="text-slate-700 dark:text-slate-300 uppercase">{e.payoutStatus || "PENDING"}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">{sym}{e.netEarning.toFixed(2)}</p>
                      <p className="text-[10px] text-slate-400 font-medium">Net Vendor Payable</p>
                    </div>
                    {e.statementUrl && (
                      <a
                        href={resolveDownloadUrl(e.statementUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-100 transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        <FaFileInvoiceDollar size={12} className="text-primary" /> Statement
                      </a>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════
//  TAB 2: USER DETAILS TAB
// ═══════════════════════════════════════════
const UserDetailsTab = ({ booking }: { booking: Booking }) => {
  const toast = useToast();
  const userIdStr = typeof booking.userId === "string" ? booking.userId : booking.userId?._id;
  const sym = getCurrencySymbol(booking.pricing?.currency || "INR");
  
  // Fetch user's previous/all bookings
  const { data: userBookingsData, isLoading: userBookingsLoading } = useGetBookingsQuery(
    { userId: userIdStr, limit: 10 },
    { skip: !userIdStr }
  );

  // Fetch user's assigned coupons
  const { data: userCouponsData, isLoading: userCouponsLoading } = useGetUserCouponsQuery(
    userIdStr as string,
    { skip: !userIdStr }
  );

  const [applyBookingCoupon, { isLoading: isApplyingCoupon }] = useApplyBookingCouponMutation();

  const userBookings: Booking[] = userBookingsData?.data?.bookings || [];
  const assignedCoupons = userCouponsData?.data?.assignedCoupons || [];
  const activeAssignedCount = userCouponsData?.data?.activeAssignedCount ?? assignedCoupons.filter((c: any) => c.status === "ACTIVE").length;
  const totalAssignedCount = userCouponsData?.data?.totalAssignedCount ?? assignedCoupons.length;

  const handleApplyAssignedCoupon = async (code: string) => {
    try {
      await applyBookingCoupon({ bookingId: booking._id, couponCode: code }).unwrap();
      toast.success(`Coupon "${code}" applied to this booking successfully!`);
    } catch (err: any) {
      toast.error(err?.data?.message || `Failed to apply coupon "${code}"`);
    }
  };

  return (
    <div className="space-y-6">
      {/* User Profile Card */}
      <SectionCard title="Customer Profile" icon={<FaUser />}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/30">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center font-bold text-white text-2xl shadow-lg">
              {getUserName(booking).charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{getUserName(booking)}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{getUserField(booking, "email")}</p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                  Account: {getUserField(booking, "account_status" as any) || "ACTIVE"}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  <FaTag size={9} />
                  <span>{activeAssignedCount} Coupons Assigned</span>
                  {totalAssignedCount > activeAssignedCount && (
                    <span className="text-purple-400 dark:text-purple-400 font-normal">({totalAssignedCount} total)</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {userIdStr && (
            <div className="flex items-center gap-2 self-start sm:self-center">
              <Link
                href={`/users/${userIdStr}`}
                className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <FaExternalLinkAlt size={11} /> View Customer Profile
              </Link>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailRow label="First Name" value={getUserField(booking, "first_name")} />
          <DetailRow label="Last Name" value={getUserField(booking, "last_name")} />
          <DetailRow label="Email Address" value={getUserField(booking, "email")} />
          <DetailRow label="Phone Number" value={getUserField(booking, "phone")} />
          <DetailRow label="User ID" value={<span className="font-mono text-xs">{userIdStr}</span>} />
          <DetailRow
            label="Assigned Coupons"
            value={
              <span className="font-bold text-purple-700 dark:text-purple-300">
                {activeAssignedCount} Active ({totalAssignedCount} Total)
              </span>
            }
          />
        </div>
      </SectionCard>

      {/* Assigned Coupons for this User Card */}
      <SectionCard
        title={`Customer's Assigned Coupons (${activeAssignedCount})`}
        icon={<FaTag className="text-purple-500" />}
      >
        {userCouponsLoading ? (
          <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <FaSyncAlt className="animate-spin text-purple-500" /> Loading customer assigned coupons...
          </div>
        ) : assignedCoupons.length === 0 ? (
          <div className="text-center py-6 text-slate-400">
            <FaTag className="mx-auto text-2xl mb-2 opacity-30" />
            <p className="text-xs font-medium">No coupons currently assigned to this customer.</p>
            {userIdStr && (
              <Link
                href={`/users/${userIdStr}`}
                className="mt-3 inline-block px-3 py-1.5 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 rounded-lg text-xs font-bold hover:bg-purple-100 transition-colors"
              >
                Manage Coupons in User Profile &rarr;
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700/50 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Coupon Code</th>
                    <th className="py-2.5 px-3">Discount</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Usage</th>
                    <th className="py-2.5 px-3">Valid Till</th>
                    <th className="py-2.5 px-3 text-right">Order Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {assignedCoupons.map((c: any) => {
                    const coupon = c.couponId || {};
                    const isCurrentApplied =
                      booking.couponCode === coupon.code ||
                      (booking.coupon && booking.coupon.code === coupon.code);
                    const isActive = c.status === "ACTIVE" && coupon.isActive;

                    return (
                      <tr key={c._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-2.5 px-3">
                          <span className="font-mono font-bold text-slate-900 dark:text-white px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                            {coupon.code || "—"}
                          </span>
                          {coupon.name && (
                            <span className="block text-[10px] text-slate-400 mt-0.5">
                              {coupon.name}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {coupon.discountType === "PERCENTAGE"
                              ? `${coupon.discountValue}% OFF`
                              : `${sym}${coupon.discountValue} FLAT`}
                          </span>
                          {coupon.maxDiscountAmount > 0 && coupon.discountType === "PERCENTAGE" && (
                            <span className="block text-[10px] text-slate-400">
                              Up to {sym}{coupon.maxDiscountAmount}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              c.status === "ACTIVE"
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                                : c.status === "REVOKED"
                                ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                          {c.usageCount || 0} / {coupon.perUserLimit || 1} used
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">
                          {coupon.validTill ? formatDate(coupon.validTill) : "No expiry"}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {isCurrentApplied ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                              <FaCheck size={10} /> Applied
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleApplyAssignedCoupon(coupon.code)}
                              disabled={!isActive || isApplyingCoupon}
                              className="px-2.5 py-1 bg-primary hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
                            >
                              Apply to Booking
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </SectionCard>

      {/* User's Booking History */}
      <SectionCard title="User's Booking History" icon={<FaClipboardList />}>
        {userBookingsLoading ? (
          <div className="py-6 text-center text-xs text-slate-400">Loading user booking history...</div>
        ) : userBookings.length === 0 ? (
          <p className="text-xs text-slate-400 py-4">No other bookings found for this customer.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700/50 text-slate-400 font-bold uppercase">
                  <th className="py-2.5 px-3">Booking Code</th>
                  <th className="py-2.5 px-3">Store</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Created Date</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {userBookings.map((b) => {
                  const statusCfg = STATUS_BADGE[b.status] || { label: b.status, color: "bg-slate-100 text-slate-700" };
                  return (
                    <tr key={b._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-white">
                        {b.bookingCode}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                        {getStoreName(b.storeId)}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusCfg.color}`}>
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">
                        {formatDate(b.createdAt)}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <Link
                          href={`/bookings/${b._id}`}
                          className="text-primary hover:underline font-bold text-xs"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
};

// ═══════════════════════════════════════════
//  TAB 3: STORE DETAILS TAB (INC. STORE OWNER)
// ═══════════════════════════════════════════
const StoreDetailsTab = ({ booking }: { booking: any }) => {
  const store = typeof booking.storeId === "object" ? booking.storeId : null;
  const storeOwner = store?.store_owner_id && typeof store.store_owner_id === "object" ? store.store_owner_id : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Store Information */}
      <SectionCard title="Facility / Store Details" icon={<FaStore />}>
        {store ? (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100 dark:border-slate-700/30">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-pink-100 dark:bg-pink-500/10 flex items-center justify-center text-pink-600 dark:text-pink-400 shadow">
                  <FaStore className="text-xl" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-base">{store.store_name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Luggage Storage Facility Hub</p>
                </div>
              </div>

              <Link
                href={`/store/${store._id}`}
                className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 self-start sm:self-center cursor-pointer shadow-sm"
              >
                <FaExternalLinkAlt size={10} /> View Store
              </Link>
            </div>
            <DetailRow label="Store Name" value={store.store_name} />
            <DetailRow label="Contact Number" value={store.store_contact_number || "—"} />
            <DetailRow label="Current Load / Capacity" value={`${store.current_capacity ?? 0} / ${store.max_capacity ?? 0} bags stored`} />
            <DetailRow label="Store Address" value={store.address || "—"} />
            <DetailRow label="Store ID" value={<span className="font-mono text-xs">{store._id}</span>} />

            {booking.storage && (
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/30">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Storage Timestamps</p>
                <DetailRow label="Stored At" value={formatDate(booking.storage.storedAt || booking.storage.startedAt)} />
                <DetailRow label="Expected Duration" value={booking.storage.expectedDurationHours ? `${booking.storage.expectedDurationHours} hours` : "—"} />
                <DetailRow label="Released At" value={formatDate(booking.storage.releasedAt)} />
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <FaStore className="text-3xl text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-xs font-medium text-slate-400">No store assigned to this booking yet</p>
          </div>
        )}
      </SectionCard>

      {/* Store Owner Information */}
      <SectionCard title="Store Owner Details" icon={<FaUserTie />}>
        {storeOwner ? (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100 dark:border-slate-700/30">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow">
                  <FaUserTie className="text-xl" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-base">
                    {`${storeOwner.first_name || ""} ${storeOwner.last_name || ""}`.trim() || "Store Owner"}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Owner Account</p>
                </div>
              </div>

              <Link
                href={`/storeowner/${storeOwner._id}`}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 self-start sm:self-center cursor-pointer shadow-sm"
              >
                <FaExternalLinkAlt size={10} /> View Owner
              </Link>
            </div>
            <DetailRow label="First Name" value={storeOwner.first_name || "—"} />
            <DetailRow label="Last Name" value={storeOwner.last_name || "—"} />
            <DetailRow label="Email Address" value={storeOwner.email || "—"} />
            <DetailRow label="Phone Number" value={storeOwner.phone || "—"} />
            <DetailRow label="Account Status" value={
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 uppercase">
                {storeOwner.account_status || storeOwner.status || "ACTIVE"}
              </span>
            } />
          </>
        ) : (
          <p className="text-xs text-slate-400 py-6 text-center">Store owner information not available or not linked.</p>
        )}
      </SectionCard>
    </div>
  );
};

// ═══════════════════════════════════════════
//  TAB 4: DRIVER DETAILS & SETTLEMENT TAB
// ═══════════════════════════════════════════
const DriverDetailsTab = ({
  booking,
  onRegenerateStatement,
  isRegenerating,
  onOpenDriverModal,
}: {
  booking: any;
  onRegenerateStatement: () => void;
  isRegenerating: boolean;
  onOpenDriverModal: (mode: "assign" | "reassign" | "return") => void;
}) => {
  const pickupDriver = typeof booking.pickup?.assignment?.driverId === "object" ? booking.pickup.assignment.driverId : null;
  const returnDriver = typeof booking.delivery?.assignment?.driverId === "object" ? booking.delivery.assignment.driverId : null;
  const earnings = booking.earnings || [];
  const currency = booking.pricing?.currency || booking.pricing?.pricingSnapshot?.currency || "INR";
  const sym = getCurrencySymbol(currency);

  return (
    <div className="space-y-6">
      {/* Live Driver Search & Dispatch Radar */}
      <LiveDriverDispatchCard booking={booking} />

      {/* Master OTP Verification Center */}
      <MasterOtpCard booking={booking} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pickup Driver */}
        <SectionCard title="Pickup Driver Details" icon={<FaTruck />}>
          {pickupDriver ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100 dark:border-slate-700/30">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow">
                    <FaTruck className="text-xl" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{getDriverName(booking.pickup?.assignment)}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Pickup Driver Partner</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenDriverModal("reassign")}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Reassign
                  </button>
                  <Link
                    href={`/drivers/${pickupDriver._id}`}
                    className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <FaExternalLinkAlt size={10} /> Profile
                  </Link>
                </div>
              </div>
              <DetailRow label="Phone Number" value={pickupDriver.phone || "—"} />
              <DetailRow label="Vehicle Model" value={pickupDriver.vehicle_details?.model || "—"} />
              <DetailRow label="Vehicle Number" value={pickupDriver.vehicle_details?.vehicle_number || "—"} />
              <DetailRow label="Assigned At" value={formatDate(booking.pickup?.assignment?.assignedAt)} />
              <DetailRow label="Accepted At" value={formatDate(booking.pickup?.assignment?.acceptedAt)} />
              <DetailRow label="Completed At" value={formatDate(booking.pickup?.assignment?.completedAt)} />
              <OtpBadge otp={booking.pickup?.assignment?.otp} label="Pickup OTP" color="bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400" />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <FaTruck className="text-2xl" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">No Pickup Driver Assigned</p>
                <p className="text-xs text-slate-400 mt-0.5">Assign a driver partner or let the system auto-dispatch</p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => onOpenDriverModal("assign")}
                  className="px-4 py-2 bg-primary hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow flex items-center gap-1.5 cursor-pointer"
                >
                  <FaTruck className="text-xs" /> Assign Driver
                </button>
                <button
                  onClick={() => onOpenDriverModal("reassign")}
                  className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <FaRobot className="text-xs" /> Auto Radar
                </button>
              </div>
            </div>
          )}
        </SectionCard>

        {/* Return / Delivery Driver */}
        <SectionCard title="Return / Delivery Driver Details" icon={<FaTruck />}>
          {returnDriver ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100 dark:border-slate-700/30">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow">
                    <FaTruck className="text-xl" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{getDriverName(booking.delivery?.assignment)}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Return Delivery Partner</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenDriverModal("return")}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Reassign
                  </button>
                  <Link
                    href={`/drivers/${returnDriver._id}`}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <FaExternalLinkAlt size={10} /> Profile
                  </Link>
                </div>
              </div>
              <DetailRow label="Phone Number" value={returnDriver.phone || "—"} />
              <DetailRow label="Vehicle Model" value={returnDriver.vehicle_details?.model || "—"} />
              <DetailRow label="Vehicle Number" value={returnDriver.vehicle_details?.vehicle_number || "—"} />
              <DetailRow label="Assigned At" value={formatDate(booking.delivery?.assignment?.assignedAt)} />
              <DetailRow label="Accepted At" value={formatDate(booking.delivery?.assignment?.acceptedAt)} />
              <DetailRow label="Completed At" value={formatDate(booking.delivery?.assignment?.completedAt)} />
              <OtpBadge otp={booking.delivery?.assignment?.returnOtp} label="Return Release OTP (Store → Driver)" color="bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400" />
              <OtpBadge otp={booking.delivery?.assignment?.otp} label="Delivery Handover OTP (Customer → Driver)" color="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <FaTruck className="text-2xl" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">No Return Driver Assigned</p>
                <p className="text-xs text-slate-400 mt-0.5">Assigned when customer requests delivery from storage hub</p>
              </div>
              {["stored", "return_requested", "final_payment_captured"].includes(booking.status) && (
                <button
                  onClick={() => onOpenDriverModal("return")}
                  className="mt-2 px-4 py-2 bg-primary hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow flex items-center gap-1.5 cursor-pointer"
                >
                  <FaTruck className="text-xs" /> Assign Return Driver
                </button>
              )}
            </div>
          )}
        </SectionCard>
      </div>

      {/* Driver Settlement & Earning Statements */}
      <SectionCard title="Driver Settlement & Financial Statement" icon={<FaFileInvoiceDollar />}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100 dark:border-slate-700/30">
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">Earnings & Settlement Breakdown</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Review driver payouts for this booking. Admin can recalculate statements if discrepancies are identified.
            </p>
          </div>
          <RoleGuard allowedRoles={["SUPER_ADMIN", "ADMIN", "OPERATION_MANAGER"]}>
            <button
              onClick={onRegenerateStatement}
              disabled={isRegenerating}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer shrink-0 disabled:opacity-50"
            >
              <FaSyncAlt className={isRegenerating ? "animate-spin" : ""} />
              {isRegenerating ? "Recalculating..." : "Regenerate Statement"}
            </button>
          </RoleGuard>
        </div>

        {earnings.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            No driver settlement statement generated for this booking yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700/50 text-slate-400 font-bold uppercase">
                  <th className="py-2.5 px-3">Recipient</th>
                  <th className="py-2.5 px-3">Purpose</th>
                  <th className="py-2.5 px-3">Gross Earning</th>
                  <th className="py-2.5 px-3">Commission</th>
                  <th className="py-2.5 px-3">Net Earning</th>
                  <th className="py-2.5 px-3">Settlement Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {earnings.map((e: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white capitalize">
                      {e.recipientType || "Driver"}
                    </td>
                    <td className="py-2.5 px-3 font-semibold uppercase text-primary">
                      {e.purpose || "PICKUP"}
                    </td>
                    <td className="py-2.5 px-3 font-semibold">
                      {sym}{((e.grossAmountMinor || 0) / 100).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">
                      {sym}{((e.commissionAmountMinor || 0) / 100).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                      {sym}{((e.netEarningMinor || 0) / 100).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        e.status === "SETTLED" || e.status === "PAID"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                      }`}>
                        {e.status || "PENDING"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
};

// ═══════════════════════════════════════════
//  TAB 5: TIMELINE TAB (WITH VISUAL STEPPER)
// ═══════════════════════════════════════════
const TimelineTab = ({ booking }: { booking: Booking }) => {
  const LIFECYCLE_STEPS = [
    { key: "created", label: "Booking Placed", match: ["created", "payment_pending"] },
    { key: "store_assigned", label: "Store Reserved", match: ["store_assigned"] },
    { key: "driver_assigned", label: "Driver Dispatched", match: ["driver_assigned", "driver_arrived"] },
    { key: "picked_up", label: "Luggage In Transit", match: ["picked_up", "at_store"] },
    { key: "stored", label: "Stored in Vault", match: ["stored"] },
    { key: "return_requested", label: "Return Requested", match: ["return_requested", "final_payment_pending", "final_payment_captured"] },
    { key: "out_for_return", label: "Out for Delivery", match: ["return_driver_assigned", "out_for_return", "arrived_for_delivery"] },
    { key: "delivered", label: "Delivered", match: ["delivered"] },
  ];

  const currentStepIdx = LIFECYCLE_STEPS.findIndex(step => step.match.includes(booking.status));
  const isCancelled = booking.status === "cancelled" || booking.status === "driver_cancelled_critical";

  return (
    <div className="space-y-6">
      {/* Visual Stepper Card */}
      <SectionCard title="Lifecycle Progression Tracker" icon={<FaClock />}>
        {isCancelled ? (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-center gap-3">
            <FaTimesCircle className="text-rose-600 dark:text-rose-400 text-xl shrink-0" />
            <div>
              <p className="text-sm font-bold text-rose-800 dark:text-rose-200">
                Booking Cancelled ({booking.status === "driver_cancelled_critical" ? "Driver Emergency Cancel" : "Cancelled"})
              </p>
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-0.5">
                {booking.cancellation_reason || (booking as any).cancelReason || "Cancelled by admin or customer"}
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto py-2">
            <div className="flex items-center min-w-[700px] justify-between relative">
              {LIFECYCLE_STEPS.map((step, idx) => {
                const isCompleted = currentStepIdx > idx || booking.status === "delivered";
                const isCurrent = currentStepIdx === idx && booking.status !== "delivered";

                return (
                  <div key={step.key} className="flex flex-col items-center relative flex-1 text-center">
                    {/* Connecting Line */}
                    {idx < LIFECYCLE_STEPS.length - 1 && (
                      <div className={`absolute top-4 left-1/2 right-[-50%] h-1 z-0 ${
                        isCompleted ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700"
                      }`} />
                    )}

                    {/* Step Node */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 transition-all shadow-sm ${
                      isCompleted
                        ? "bg-emerald-500 text-white ring-4 ring-emerald-100 dark:ring-emerald-950"
                        : isCurrent
                        ? "bg-primary text-white ring-4 ring-blue-100 dark:ring-blue-950 animate-pulse"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-300 dark:border-slate-700"
                    }`}>
                      {isCompleted ? <FaCheck className="text-[10px]" /> : idx + 1}
                    </div>

                    {/* Step Label */}
                    <span className={`text-[11px] font-bold mt-2 max-w-[85px] leading-tight ${
                      isCurrent
                        ? "text-primary"
                        : isCompleted
                        ? "text-slate-900 dark:text-white"
                        : "text-slate-400 dark:text-slate-500"
                    }`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </SectionCard>

      {/* Chronological Event History Log */}
      <SectionCard title="Chronological Event Audit Trail" icon={<FaHistory />}>
        {!booking.timeline || booking.timeline.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FaClock className="text-3xl text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-xs font-medium text-slate-400">No detailed timeline events recorded yet</p>
          </div>
        ) : (
          <div className="space-y-0 pt-2">
            {booking.timeline.map((entry: TimelineEntry, i: number) => {
              const statusCfg = STATUS_BADGE[entry.status] || { label: entry.status, color: "bg-slate-100 text-slate-700" };
              return (
                <div key={i} className="flex gap-4 relative">
                  <div className="flex flex-col items-center">
                    <div className={`w-3.5 h-3.5 rounded-full border-[3px] border-white dark:border-[#1a2332] shadow-sm z-10 ${
                      i === 0 ? "bg-primary" : "bg-slate-300 dark:bg-slate-600"
                    }`} />
                    {i < booking.timeline!.length - 1 && (
                      <div className="w-0.5 flex-1 bg-slate-200 dark:bg-slate-700 min-h-[40px]" />
                    )}
                  </div>

                  <div className="pb-6 -mt-0.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${statusCfg.color}`}>
                        {statusCfg.label}
                      </span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                        {formatDate(entry.createdAt)}
                      </span>
                      {entry.role && (
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                          By {entry.role}
                        </span>
                      )}
                    </div>
                    {entry.note && (
                      <p className="text-xs text-slate-700 dark:text-slate-300 mt-1.5 leading-relaxed font-medium">{entry.note}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>
    </div>
  );
};

// ═══════════════════════════════════════════
//  TAB 8: REVIEWS & CUSTOMER FEEDBACK TAB
// ═══════════════════════════════════════════
const ReviewsFeedbackTab = ({ booking }: { booking: Booking }) => {
  const reviews: BookingReview[] = (booking as any)?.reviews || [];

  // Categorize reviews
  const driverReview = reviews.find((r) => r.reviewType === "DRIVER");
  const storeReview = reviews.find((r) => r.reviewType === "STORE");
  const platformReview = reviews.find((r) => r.reviewType === "PLATFORM" || r.reviewType === "SERVICE");

  const hasReviews = reviews.length > 0;
  const avgRating = hasReviews
    ? (reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / reviews.length).toFixed(1)
    : null;

  // Star Rating Helper component
  const StarDisplay = ({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" | "lg" }) => {
    const starClass = size === "lg" ? "text-lg" : size === "md" ? "text-sm" : "text-xs";
    return (
      <div className="flex items-center gap-1 text-amber-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star}>
            {rating >= star ? (
              <FaStar className={starClass} />
            ) : (
              <FaRegStar className={`${starClass} text-slate-300 dark:text-slate-600`} />
            )}
          </span>
        ))}
        <span className="ml-1.5 font-bold text-slate-800 dark:text-slate-200 text-xs">
          {Number(rating).toFixed(1)} / 5.0
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Summary Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border border-amber-200/60 dark:border-amber-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center text-xl shadow-inner">
            <FaStar />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Customer Rating & Feedback
              </h3>
              {hasReviews ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/20">
                  Reviewed ({reviews.length} {reviews.length === 1 ? "Category" : "Categories"})
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  Pending Review
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Customer feedback submitted for Delivery Driver, Storage Facility, and Holdit Platform.
            </p>
          </div>
        </div>

        {hasReviews && avgRating && (
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-2.5 rounded-xl border border-amber-200 dark:border-amber-900/40 shadow-sm">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Overall Average</span>
              <div className="text-lg font-black text-amber-500">{avgRating} <span className="text-xs font-normal text-slate-400">/ 5.0</span></div>
            </div>
            <div className="text-2xl text-amber-400">★</div>
          </div>
        )}
      </div>

      {/* 2. No Reviews Empty State */}
      {!hasReviews && (
        <SectionCard title="Customer Reviews" icon={<FaStar />}>
          <div className="text-center py-12 px-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto text-2xl mb-3">
              <FaRegStar />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              No Reviews Submitted Yet
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              {booking.status === "delivered"
                ? "This booking has been delivered, but the customer has not submitted their post-delivery ratings or review yet."
                : "Reviews can be submitted by the customer once the booking is completed and delivered."}
            </p>
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs text-slate-500 font-medium">
              <FaInfoCircle className="text-slate-400" />
              Customer: {getUserName(booking)} ({getUserField(booking, "phone") || "No Phone"})
            </div>
          </div>
        </SectionCard>
      )}

      {/* 3. Detailed Breakdown of Who User Rated and How Much */}
      {hasReviews && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* DRIVER REVIEW CARD */}
          <div className="rounded-2xl bg-white dark:bg-[#1a2332] border border-slate-200 dark:border-slate-700/60 p-5 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-bold">
                    <FaTruck />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Delivery Driver</h4>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Service Leg Partner</span>
                  </div>
                </div>
                {driverReview ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                    ★ {Number(driverReview.rating).toFixed(1)}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-400">
                    Not Rated
                  </span>
                )}
              </div>

              {driverReview ? (
                <div className="mt-4 space-y-3">
                  {/* Rated Partner Info */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                    <div className="text-[10px] text-slate-400 font-semibold mb-0.5 tracking-wider uppercase">Rated Driver</div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      {driverReview.driverId?.first_name
                        ? `${driverReview.driverId.first_name} ${driverReview.driverId.last_name || ""}`.trim()
                        : getDriverName(booking.delivery?.assignment || booking.pickup?.assignment)}
                    </div>
                    {(driverReview.driverId?.phone || (booking.delivery?.assignment?.driverId as any)?.phone) && (
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        📞 {driverReview.driverId?.phone || (booking.delivery?.assignment?.driverId as any)?.phone}
                      </div>
                    )}
                  </div>

                  {/* Rating Stars */}
                  <div>
                    <div className="text-[10px] text-slate-400 font-semibold mb-1 tracking-wider uppercase">Customer Rating</div>
                    <StarDisplay rating={driverReview.rating} size="md" />
                  </div>

                  {/* Tags */}
                  {driverReview.tags && driverReview.tags.length > 0 && (
                    <div>
                      <div className="text-[10px] text-slate-400 font-semibold mb-1.5 tracking-wider uppercase">Feedback Tags</div>
                      <div className="flex flex-wrap gap-1.5">
                        {driverReview.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/40"
                          >
                            ✓ {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Comment */}
                  {driverReview.comment ? (
                    <div>
                      <div className="text-[10px] text-slate-400 font-semibold mb-1 tracking-wider uppercase">Written Feedback</div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50 text-xs text-slate-700 dark:text-slate-300 italic flex gap-2">
                        <FaQuoteLeft className="text-slate-400 shrink-0 text-xs mt-0.5" />
                        <span>"{driverReview.comment}"</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic">No written feedback provided.</p>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-400 italic">
                  Driver review was skipped or not submitted by customer.
                </div>
              )}
            </div>

            {driverReview?.createdAt && (
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
                Submitted on {formatDate(driverReview.createdAt)}
              </div>
            )}
          </div>

          {/* STORE REVIEW CARD */}
          <div className="rounded-2xl bg-white dark:bg-[#1a2332] border border-slate-200 dark:border-slate-700/60 p-5 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm font-bold">
                    <FaStore />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Storage Facility</h4>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Luggage Hub</span>
                  </div>
                </div>
                {storeReview ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                    ★ {Number(storeReview.rating).toFixed(1)}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-400">
                    Not Rated
                  </span>
                )}
              </div>

              {storeReview ? (
                <div className="mt-4 space-y-3">
                  {/* Rated Store Info */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                    <div className="text-[10px] text-slate-400 font-semibold mb-0.5 tracking-wider uppercase">Rated Hub</div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      {storeReview.storeId?.store_name || getStoreName(booking.storeId)}
                    </div>
                    {(storeReview.storeId?.address || getStoreField(booking.storeId, "store_address" as any)) && (
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        📍 {storeReview.storeId?.address || getStoreField(booking.storeId, "store_address" as any)}
                      </div>
                    )}
                  </div>

                  {/* Rating Stars */}
                  <div>
                    <div className="text-[10px] text-slate-400 font-semibold mb-1 tracking-wider uppercase">Customer Rating</div>
                    <StarDisplay rating={storeReview.rating} size="md" />
                  </div>

                  {/* Tags */}
                  {storeReview.tags && storeReview.tags.length > 0 && (
                    <div>
                      <div className="text-[10px] text-slate-400 font-semibold mb-1.5 tracking-wider uppercase">Feedback Tags</div>
                      <div className="flex flex-wrap gap-1.5">
                        {storeReview.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/40"
                          >
                            ✓ {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Comment */}
                  {storeReview.comment ? (
                    <div>
                      <div className="text-[10px] text-slate-400 font-semibold mb-1 tracking-wider uppercase">Written Feedback</div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50 text-xs text-slate-700 dark:text-slate-300 italic flex gap-2">
                        <FaQuoteLeft className="text-slate-400 shrink-0 text-xs mt-0.5" />
                        <span>"{storeReview.comment}"</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic">No written feedback provided.</p>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-400 italic">
                  Store facility review was skipped or not submitted by customer.
                </div>
              )}
            </div>

            {storeReview?.createdAt && (
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
                Submitted on {formatDate(storeReview.createdAt)}
              </div>
            )}
          </div>

          {/* PLATFORM / APP REVIEW CARD */}
          <div className="rounded-2xl bg-white dark:bg-[#1a2332] border border-slate-200 dark:border-slate-700/60 p-5 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center text-sm font-bold">
                    <FaBolt />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Holdit Platform</h4>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Service & App Experience</span>
                  </div>
                </div>
                {platformReview ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                    ★ {Number(platformReview.rating).toFixed(1)}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-400">
                    Not Rated
                  </span>
                )}
              </div>

              {platformReview ? (
                <div className="mt-4 space-y-3">
                  {/* Rated Platform Info */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                    <div className="text-[10px] text-slate-400 font-semibold mb-0.5 tracking-wider uppercase">Rated Service</div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      Holdit Luggage Network & Mobile App
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Customer: {getUserName(booking)}
                    </div>
                  </div>

                  {/* Rating Stars */}
                  <div>
                    <div className="text-[10px] text-slate-400 font-semibold mb-1 tracking-wider uppercase">Customer Rating</div>
                    <StarDisplay rating={platformReview.rating} size="md" />
                  </div>

                  {/* Tags */}
                  {platformReview.tags && platformReview.tags.length > 0 && (
                    <div>
                      <div className="text-[10px] text-slate-400 font-semibold mb-1.5 tracking-wider uppercase">Feedback Tags</div>
                      <div className="flex flex-wrap gap-1.5">
                        {platformReview.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900/40"
                          >
                            ✓ {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Comment */}
                  {platformReview.comment ? (
                    <div>
                      <div className="text-[10px] text-slate-400 font-semibold mb-1 tracking-wider uppercase">Written Feedback</div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50 text-xs text-slate-700 dark:text-slate-300 italic flex gap-2">
                        <FaQuoteLeft className="text-slate-400 shrink-0 text-xs mt-0.5" />
                        <span>"{platformReview.comment}"</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic">No written feedback provided.</p>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-400 italic">
                  Platform experience review was skipped or not submitted.
                </div>
              )}
            </div>

            {platformReview?.createdAt && (
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
                Submitted on {formatDate(platformReview.createdAt)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════
//  PHOTO LIGHTBOX MODAL
// ═══════════════════════════════════════════
const PhotoLightboxModal = ({
  photoUrl,
  stageLabel,
  photoIndex,
  onClose,
}: {
  photoUrl: string;
  stageLabel: string;
  photoIndex: number;
  onClose: () => void;
}) => {
  if (!photoUrl) return null;
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in cursor-zoom-out"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-4xl w-full max-h-[90vh] bg-[#111827] rounded-2xl overflow-hidden shadow-2xl border border-slate-700 flex flex-col cursor-default"
      >
        <div className="px-5 py-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary text-white">
              {stageLabel}
            </span>
            <span className="text-xs text-slate-300 font-mono font-medium">
              Photo #{photoIndex}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={photoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg text-xs transition-colors flex items-center gap-1.5 font-medium cursor-pointer"
              title="Open full resolution in new tab"
            >
              <FaExternalLinkAlt className="text-xs" /> Full Res
            </a>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg text-xs transition-colors cursor-pointer"
            >
              <FaTimes className="text-sm" />
            </button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-4 overflow-hidden bg-black/60 min-h-[300px]">
          <img
            src={photoUrl}
            alt={`${stageLabel} photo ${photoIndex}`}
            className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-md"
          />
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════
//  TAB 2: LUGGAGE & PROOF PHOTOS TAB
// ═══════════════════════════════════════════
const LuggagePhotosTab = ({ booking }: { booking: any }) => {
  const [filter, setFilter] = useState<"all" | "pickup" | "store" | "delivery">("all");
  const [previewPhoto, setPreviewPhoto] = useState<{ url: string; label: string; index: number } | null>(null);

  const pickupPhotos: string[] = booking.luggagePhotos?.pickup || booking.pickup?.photos || [];
  const storePhotos: string[] = booking.luggagePhotos?.store || booking.luggagePhotos?.storage || booking.storage?.photos || [];
  const deliveryPhotos: string[] = booking.luggagePhotos?.delivery || booking.delivery?.photos || [];

  const allPhotos = useMemo(() => {
    const list: { url: string; stage: "pickup" | "store" | "delivery"; stageLabel: string; index: number }[] = [];
    pickupPhotos.forEach((url, i) => list.push({ url, stage: "pickup", stageLabel: "Pickup Proof", index: i + 1 }));
    storePhotos.forEach((url, i) => list.push({ url, stage: "store", stageLabel: "Store Inward Proof", index: i + 1 }));
    deliveryPhotos.forEach((url, i) => list.push({ url, stage: "delivery", stageLabel: "Delivery Proof", index: i + 1 }));
    return list;
  }, [pickupPhotos, storePhotos, deliveryPhotos]);

  const filteredPhotos = useMemo(() => {
    if (filter === "all") return allPhotos;
    return allPhotos.filter((p) => p.stage === filter);
  }, [allPhotos, filter]);

  return (
    <div className="space-y-6">
      {/* Lightbox Preview */}
      {previewPhoto && (
        <PhotoLightboxModal
          photoUrl={previewPhoto.url}
          stageLabel={previewPhoto.label}
          photoIndex={previewPhoto.index}
          onClose={() => setPreviewPhoto(null)}
        />
      )}

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          onClick={() => setFilter("all")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            filter === "all"
              ? "border-primary bg-primary/5 dark:bg-primary/10 ring-2 ring-primary/20"
              : "border-slate-200 dark:border-slate-700/50 bg-white dark:bg-[#1a2332] hover:border-slate-300"
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Total Photos</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white">{allPhotos.length}</span>
        </div>

        <div
          onClick={() => setFilter("pickup")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            filter === "pickup"
              ? "border-blue-500 bg-blue-50/50 dark:bg-blue-500/10 ring-2 ring-blue-500/20"
              : "border-slate-200 dark:border-slate-700/50 bg-white dark:bg-[#1a2332] hover:border-slate-300"
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-500 block mb-1">1. Pickup Proof</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white">{pickupPhotos.length}</span>
        </div>

        <div
          onClick={() => setFilter("store")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            filter === "store"
              ? "border-purple-500 bg-purple-50/50 dark:bg-purple-500/10 ring-2 ring-purple-500/20"
              : "border-slate-200 dark:border-slate-700/50 bg-white dark:bg-[#1a2332] hover:border-slate-300"
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-500 block mb-1">2. Store Inward</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white">{storePhotos.length}</span>
        </div>

        <div
          onClick={() => setFilter("delivery")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            filter === "delivery"
              ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/10 ring-2 ring-emerald-500/20"
              : "border-slate-200 dark:border-slate-700/50 bg-white dark:bg-[#1a2332] hover:border-slate-300"
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-500 block mb-1">3. Delivery Handover</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white">{deliveryPhotos.length}</span>
        </div>
      </div>

      {/* Main Gallery Card */}
      <SectionCard title="Luggage & Verification Proof Gallery" icon={<FaCamera />}>
        {allPhotos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mb-3">
              <FaCamera className="text-3xl" />
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">No Luggage Photos Uploaded</p>
            <p className="text-xs text-slate-400 max-w-sm">
              Photos uploaded by the driver during pickup, storage inward verification, and delivery handover will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pt-2">
            {filteredPhotos.map((photo, idx) => {
              const fullUrl = resolveImgUrl(photo.url);
              const stageBadgeColor =
                photo.stage === "pickup"
                  ? "bg-blue-600 text-white"
                  : photo.stage === "store"
                  ? "bg-purple-600 text-white"
                  : "bg-emerald-600 text-white";

              return (
                <div
                  key={idx}
                  onClick={() => setPreviewPhoto({ url: fullUrl, label: photo.stageLabel, index: photo.index })}
                  className="group relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 aspect-square shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <img
                    src={fullUrl}
                    alt={`${photo.stageLabel} ${photo.index}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 opacity-80 group-hover:opacity-90 transition-opacity" />

                  {/* Top Badge */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold shadow-sm ${stageBadgeColor}`}>
                      {photo.stageLabel}
                    </span>
                    <span className="p-1.5 rounded-lg bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <FaExpand className="text-[10px]" />
                    </span>
                  </div>

                  {/* Bottom Label */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white">
                    <span className="text-xs font-bold font-mono">Photo #{photo.index}</span>
                    <span className="text-[10px] opacity-80 underline">Click to view</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>
    </div>
  );
};

// ═══════════════════════════════════════════
//  MAIN BOOKING DETAILS CLIENT COMPONENT
// ═══════════════════════════════════════════
export default function BookingDetailsClient({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<TabKey>("booking");

  const { data, isLoading, isError } = useGetBookingQuery(bookingId);

  const [cancelBooking] = useCancelBookingMutation();
  const [assignDriver] = useAssignDriverMutation();
  const [reassignDriver] = useReassignDriverMutation();
  const [processCriticalCancel] = useProcessCriticalCancelMutation();
  const [markArrived] = useMarkArrivedMutation();
  const [markPickedUp] = useMarkPickedUpMutation();
  const [markStored] = useMarkStoredMutation();
  const [requestReturn] = useRequestReturnMutation();
  const [assignReturnDriver] = useAssignReturnDriverMutation();
  const [markDelivered] = useMarkDeliveredMutation();
  const [regenerateStatement, { isLoading: isRegenerating }] = useRegenerateStatementMutation();

  const handleAction = async (actionFn: any, successMessage: string, params?: any) => {
    try {
      await actionFn(params || bookingId).unwrap();
      toast.success(successMessage);
    } catch {
      toast.error("Action failed");
    }
  };

  // Driver Reassignment / Assignment Modal State
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [driverModalMode, setDriverModalMode] = useState<"assign" | "reassign" | "return">("reassign");
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");
  const [driverSearch, setDriverSearch] = useState<string>("");
  const [driverFilterTab, setDriverFilterTab] = useState<"all" | "online" | "available">("all");
  const [isAssigningDriver, setIsAssigningDriver] = useState(false);

  // Fetch available drivers for modal dropdown
  const { data: driversResponse, isLoading: isDriversLoading, refetch: refetchDrivers } = useGetDriversQuery(
    { page: 1, limit: 100, account_status: "ACTIVE" },
    { skip: !showDriverModal }
  );
  const rawDriversList = driversResponse?.data?.drivers || [];

  const filteredDrivers = useMemo(() => {
    return rawDriversList.filter((d: any) => {
      const name = `${d.first_name || ""} ${d.last_name || ""}`.toLowerCase();
      const phone = d.phone || "";
      const email = (d.email || "").toLowerCase();
      const id = d._id || "";
      const query = driverSearch.trim().toLowerCase();

      const searchMatch = !query || name.includes(query) || phone.includes(query) || email.includes(query) || id.includes(query);
      if (!searchMatch) return false;

      if (driverFilterTab === "online") return !!d.is_online;
      if (driverFilterTab === "available") return !!d.is_online && !d.is_on_trip;
      return true;
    });
  }, [rawDriversList, driverSearch, driverFilterTab]);

  const handleOpenDriverModal = (mode: "assign" | "reassign" | "return") => {
    setDriverModalMode(mode);
    setSelectedDriverId("");
    setDriverSearch("");
    setDriverFilterTab("all");
    setShowDriverModal(true);
    refetchDrivers();
  };

  const handleConfirmDriverAssignment = async () => {
    setIsAssigningDriver(true);
    try {
      if (selectedDriverId === "AUTO_DISPATCH" || !selectedDriverId) {
        // Trigger automated driver search
        await reassignDriver({ bookingId }).unwrap();
        toast.success("Automated driver search & dispatch triggered!");
      } else {
        // Direct assignment
        if (driverModalMode === "return") {
          await assignReturnDriver({ bookingId, driverId: selectedDriverId }).unwrap();
          toast.success("Return driver assigned successfully!");
        } else if (driverModalMode === "reassign") {
          await reassignDriver({ bookingId, driverId: selectedDriverId }).unwrap();
          toast.success("Driver reassigned successfully!");
        } else {
          await assignDriver({ bookingId, driverId: selectedDriverId }).unwrap();
          toast.success("Driver assigned successfully!");
        }
      }
      setShowDriverModal(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to assign driver");
    } finally {
      setIsAssigningDriver(false);
    }
  };

  const handleAssignDriver = () => {
    handleOpenDriverModal("assign");
  };

  const handleReassignDriver = () => {
    handleOpenDriverModal("reassign");
  };

  const handleApproveCriticalCancel = () => {
    const reason = prompt("Enter reason for approving critical cancellation:");
    if (reason !== null) {
      handleAction(processCriticalCancel, "Critical cancellation approved!", { bookingId, reason: reason.trim() || "Approved by support/admin" });
    }
  };

  const handleAssignReturnDriver = () => {
    handleOpenDriverModal("return");
  };

  const handleForceCancelBooking = async () => {
    const reason = prompt("Enter reason for force-cancelling this booking:", "Force cancelled by Admin / Support");
    if (reason === null) return;
    try {
      await cancelBooking({ id: bookingId, reason: reason.trim() || "Force cancelled by Admin" }).unwrap();
      toast.success("Booking force-cancelled successfully");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to cancel booking");
    }
  };

  const handleRegenerateStatement = async () => {
    try {
      await regenerateStatement(bookingId).unwrap();
      toast.success("Settlement statement regenerated successfully!");
    } catch {
      toast.error("Failed to regenerate statement");
    }
  };

  if (isLoading) return <DetailsPageSkeleton />;

  if (isError || !data?.data) return (
    <div className="flex-1 flex items-center justify-center p-8 text-center">
      <div>
        <p className="text-lg font-bold text-slate-900 dark:text-white mb-2">Booking not found</p>
        <button onClick={() => router.back()} className="text-primary font-medium hover:underline cursor-pointer">Go back</button>
      </div>
    </div>
  );

  const booking: Booking = data.data;
  const statusCfg = STATUS_BADGE[booking.status] || { label: booking.status, color: "bg-slate-100 text-slate-700" };

  // Tab content renderer
  const renderTabContent = () => {
    switch (activeTab) {
      case "booking":
        return <BookingDetailsTab booking={booking} />;
      case "financials":
        return <FinancialsTab booking={booking} />;
      case "photos":
        return <LuggagePhotosTab booking={booking} />;
      case "user":
        return <UserDetailsTab booking={booking} />;
      case "store":
        return <StoreDetailsTab booking={booking} />;
      case "driver":
        return (
          <DriverDetailsTab
            booking={booking}
            onRegenerateStatement={handleRegenerateStatement}
            isRegenerating={isRegenerating}
            onOpenDriverModal={handleOpenDriverModal}
          />
        );
      case "timeline":
        return <TimelineTab booking={booking} />;
      case "reviews":
        return <ReviewsFeedbackTab booking={booking} />;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-background text-foreground">
      {/* ── Header ── */}
      <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700/50 bg-white dark:bg-[#1a2332] sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <FaArrowLeft />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Booking #{booking.bookingCode || bookingId.slice(-6)}
              </h1>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusCfg.color}`}>
                {statusCfg.label}
              </span>
              {booking.isExpressDelivery && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                  EXPRESS
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Created {formatDate(booking.createdAt)}
              {booking.updatedAt && ` · Last updated ${formatDate(booking.updatedAt)}`}
            </p>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.key
                  ? "bg-primary text-white shadow-sm ring-1 ring-primary/30"
                  : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <span className="text-xs">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div className="flex-1 p-6">{renderTabContent()}</div>

      {/* ── Actions Bar (Role-Guarded & Status-Driven) ── */}
      {(() => {
        const isCancelled = ["cancelled", "cancelled_by_user", "cancelled_by_driver", "cancelled_by_store"].includes(booking.status);
        const isDelivered = booking.status === "delivered";
        const isTerminal = isCancelled || isDelivered;

        if (isTerminal) {
          return (
            <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-[#1a2332] sticky bottom-0 text-center">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {isCancelled
                  ? "This booking has been cancelled. Status updates are disabled."
                  : "This booking has been delivered & completed. All lifecycle operations are complete."}
              </p>
            </div>
          );
        }

        return (
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700/50 bg-white dark:bg-[#1a2332] sticky bottom-0 z-10 shadow-md">
            <div className="flex flex-wrap items-center gap-2.5">
              <RoleGuard allowedRoles={["SUPER_ADMIN", "ADMIN", "OPERATION_MANAGER", "CUSTOMER_SUPPORT"]}>
                {/* Awaiting advance payment hint */}
                {["created", "payment_pending"].includes(booking.status) && (
                  <div className="text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-500/20 mr-2">
                    Awaiting customer advance payment before driver dispatch
                  </div>
                )}

                {/* Pickup Driver Assignment (Store Assigned stage) */}
                {["store_assigned"].includes(booking.status) && (
                  <>
                    <button onClick={handleAssignDriver} className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm">
                      <FaUserPlus className="text-xs" /> Assign Pickup Driver
                    </button>
                    <button onClick={handleReassignDriver} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm">
                      <FaRobot className="text-xs" /> Auto-Dispatch Radar
                    </button>
                  </>
                )}

                {/* Driver Assigned -> Mark Arrived */}
                {booking.status === "driver_assigned" && (
                  <>
                    <button onClick={() => handleAction(markArrived, "Marked as Arrived at Pickup")} className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-xs font-bold hover:bg-cyan-700 transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm">
                      <FaCheckCircle className="text-xs" /> Mark Driver Arrived
                    </button>
                    <button onClick={handleReassignDriver} className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm">
                      <FaSyncAlt className="text-xs" /> Reassign Driver
                    </button>
                  </>
                )}

                {/* Driver Arrived -> Mark Luggage Picked Up */}
                {booking.status === "driver_arrived" && (
                  <>
                    <button onClick={() => handleAction(markPickedUp, "Marked as Luggage Picked Up")} className="px-4 py-2 bg-teal-600 text-white rounded-lg text-xs font-bold hover:bg-teal-700 transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm">
                      <FaLuggageCart className="text-xs" /> Mark Luggage Picked Up
                    </button>
                    <button onClick={handleReassignDriver} className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm">
                      <FaSyncAlt className="text-xs" /> Reassign Driver
                    </button>
                  </>
                )}

                {/* Picked Up / At Store -> Mark Stored in Vault */}
                {["picked_up", "at_store"].includes(booking.status) && (
                  <>
                    <button onClick={() => handleAction(markStored, "Marked as Securely Stored in Vault")} className="px-4 py-2 bg-violet-600 text-white rounded-lg text-xs font-bold hover:bg-violet-700 transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm">
                      <FaWarehouse className="text-xs" /> Mark Stored in Vault
                    </button>
                    <button onClick={handleReassignDriver} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm">
                      <FaExchangeAlt className="text-xs" /> Reassign Driver (Transit Handover)
                    </button>
                  </>
                )}

                {/* Stored in Vault -> Request Return Delivery */}
                {booking.status === "stored" && (
                  <>
                    <button onClick={() => handleAction(requestReturn, "Return Delivery Requested")} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm">
                      <FaTruckLoading className="text-xs" /> Request Return Delivery
                    </button>
                    <button onClick={handleAssignReturnDriver} className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm">
                      <FaUserPlus className="text-xs" /> Assign Return Driver
                    </button>
                  </>
                )}

                {/* Return Requested / Final Payment Captured -> Assign Return Driver */}
                {["return_requested", "final_payment_captured"].includes(booking.status) && (
                  <>
                    <button onClick={handleAssignReturnDriver} className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm">
                      <FaUserPlus className="text-xs" /> Assign Return Driver
                    </button>
                    <button onClick={() => handleOpenDriverModal("return")} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm">
                      <FaRobot className="text-xs" /> Auto-Dispatch Return Driver
                    </button>
                  </>
                )}

                {/* Return Driver Assigned -> Out for Return / Delivered */}
                {booking.status === "return_driver_assigned" && (
                  <>
                    <button onClick={() => handleAction(markDelivered, "Marked as Delivered")} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm">
                      <FaCheckCircle className="text-xs" /> Mark Delivered
                    </button>
                    <button onClick={handleAssignReturnDriver} className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm">
                      <FaSyncAlt className="text-xs" /> Reassign Return Driver
                    </button>
                  </>
                )}

                {/* Out for Return / Arrived for Delivery -> Mark Delivered */}
                {["out_for_return", "arrived_for_delivery"].includes(booking.status) && (
                  <>
                    <button onClick={() => handleAction(markDelivered, "Marked as Delivered & Completed")} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm">
                      <FaCheckCircle className="text-xs" /> Mark Delivered & Complete
                    </button>
                    <button onClick={handleAssignReturnDriver} className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm">
                      <FaSyncAlt className="text-xs" /> Reassign Delivery Driver
                    </button>
                  </>
                )}

                {/* Driver Critical Cancel -> Approval and Emergency Reassignment */}
                {booking.status === "driver_cancelled_critical" && (
                  <>
                    <button onClick={handleApproveCriticalCancel} className="px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm">
                      <FaTimesCircle className="text-xs" /> Approve Critical Cancel
                    </button>
                    <button onClick={handleReassignDriver} className="px-4 py-2 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm">
                      <FaSyncAlt className="text-xs" /> Emergency Reassign Driver
                    </button>
                  </>
                )}

                {/* Force Cancel Booking Button */}
                <button
                  onClick={handleForceCancelBooking}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm ml-auto"
                  title="Forcefully cancel this booking and release all driver / store assignments"
                >
                  <FaTimesCircle className="text-xs" /> Force Cancel Booking
                </button>
              </RoleGuard>
            </div>
          </div>
        );
      })()}
      {/* ── DRIVER ASSIGNMENT / REASSIGNMENT MODAL ── */}
      {showDriverModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#1a2332] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-800/40">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                  <FaTruck className="text-lg" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {driverModalMode === "return"
                      ? "Assign Return Delivery Driver"
                      : driverModalMode === "reassign"
                      ? "Reassign Driver Partner"
                      : "Assign Pickup Driver"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Booking #{booking.bookingCode || bookingId.slice(-6)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDriverModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Mid-Trip Handover Warning Banner */}
              {[
                "picked_up",
                "at_store",
                "out_for_return",
                "arrived_for_delivery",
              ].includes(booking.status) && (
                <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-3.5 rounded-xl flex items-start gap-3 text-xs text-amber-800 dark:text-amber-300">
                  <FaInfoCircle className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0 text-sm" />
                  <div>
                    <span className="font-bold">Luggage in Transit Handover:</span> The luggage has already been picked up. When you reassign, the replacement driver will collect the luggage directly from the previous driver&apos;s current live GPS location, and proceed to the original destination.
                  </div>
                </div>
              )}

              {/* Option A: Automated Dispatch */}
              <div
                onClick={() => setSelectedDriverId("AUTO_DISPATCH")}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedDriverId === "AUTO_DISPATCH"
                    ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-sm ring-2 ring-primary/20"
                    : "border-slate-200 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-primary text-white">
                    <FaRobot className="text-lg" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-slate-900 dark:text-white">
                        Automated Driver Dispatch
                      </p>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                        RECOMMENDED
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      System algorithm finds and dispatches the closest available active driver via GeoJSON & Redis.
                    </p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  selectedDriverId === "AUTO_DISPATCH" ? "border-primary bg-primary text-white" : "border-slate-300 dark:border-slate-600"
                }`}>
                  {selectedDriverId === "AUTO_DISPATCH" && <FaCheck className="text-[10px]" />}
                </div>
              </div>

              <div className="relative flex items-center">
                <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                <span className="flex-shrink mx-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Or Manually Select Driver
                </span>
                <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
              </div>

              {/* Search & Filter Bar */}
              <div className="space-y-3">
                <div className="relative">
                  <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                  <input
                    type="text"
                    value={driverSearch}
                    onChange={(e) => setDriverSearch(e.target.value)}
                    placeholder="Search by driver name, phone, or ID..."
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                  />
                  {driverSearch && (
                    <button
                      onClick={() => setDriverSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <FaTimes className="text-xs" />
                    </button>
                  )}
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-2">
                  {[
                    { key: "all", label: "All Active" },
                    { key: "online", label: "Online Only" },
                    { key: "available", label: "Available (Free)" },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setDriverFilterTab(tab.key as any)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        driverFilterTab === tab.key
                          ? "bg-primary text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                  <span className="text-[11px] text-slate-400 ml-auto font-medium">
                    {filteredDrivers.length} driver{filteredDrivers.length !== 1 ? "s" : ""} found
                  </span>
                </div>
              </div>

              {/* Drivers Dropdown List */}
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {isDriversLoading ? (
                  <div className="py-8 text-center text-xs text-slate-400">Loading drivers...</div>
                ) : filteredDrivers.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No matching drivers found for current filter.
                  </div>
                ) : (
                  filteredDrivers.map((driver: any) => {
                    const isSelected = selectedDriverId === driver._id;
                    const isOnline = !!driver.is_online;
                    const isOnTrip = !!driver.is_on_trip;
                    const driverName = `${driver.first_name || ""} ${driver.last_name || ""}`.trim() || "Driver";

                    return (
                      <div
                        key={driver._id}
                        onClick={() => setSelectedDriverId(driver._id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-sm ring-2 ring-primary/20"
                            : "border-slate-200 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-primary text-xs shrink-0">
                            {driverName.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                                {driverName}
                              </p>
                              {isOnline ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">
                                  Offline
                                </span>
                              )}
                              {isOnTrip && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                  On Trip
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                              {driver.phone && <span className="flex items-center gap-1"><FaPhone className="text-[9px]" /> {driver.phone}</span>}
                              {driver.vehicle_type && <span className="flex items-center gap-1 capitalize"><FaMotorcycle className="text-[9px]" /> {driver.vehicle_type}</span>}
                              {driver.license_number && <span>• {driver.license_number}</span>}
                            </div>
                          </div>
                        </div>

                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ml-3 ${
                          isSelected ? "border-primary bg-primary text-white" : "border-slate-300 dark:border-slate-600"
                        }`}>
                          {isSelected && <FaCheck className="text-[8px]" />}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-800/40">
              <button
                type="button"
                onClick={() => setShowDriverModal(false)}
                disabled={isAssigningDriver}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDriverAssignment}
                disabled={isAssigningDriver}
                className="px-5 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-sm"
              >
                {isAssigningDriver ? (
                  <>Assigning...</>
                ) : selectedDriverId === "AUTO_DISPATCH" ? (
                  <><FaRobot className="text-xs" /> Trigger Automated Search</>
                ) : selectedDriverId ? (
                  <><FaCheck className="text-xs" /> Assign Selected Driver</>
                ) : (
                  <><FaBolt className="text-xs" /> Dispatch Driver</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
