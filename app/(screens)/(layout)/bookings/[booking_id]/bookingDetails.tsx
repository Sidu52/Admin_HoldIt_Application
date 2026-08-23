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
} from "../../../../services/bookingApi";
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
} from "react-icons/fa";
import { Booking, PopulatedUser, PopulatedStore, TimelineEntry } from "@/app/types/booking";

// ── Tabs ──
const TABS = [
  { key: "booking", label: "Booking Details", icon: <FaClipboardList /> },
  { key: "photos", label: "Luggage Photos", icon: <FaImages /> },
  { key: "user", label: "User Details", icon: <FaUser /> },
  { key: "store", label: "Store Details", icon: <FaStore /> },
  { key: "driver", label: "Driver Details", icon: <FaTruck /> },
  { key: "timeline", label: "Booking Timeline", icon: <FaClock /> },
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
    "http://localhost:5000";
  return `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
};

// ── Status Badge Map ──
const STATUS_BADGE: Record<string, { label: string; color: string }> = {
  created: { label: "Created", color: "bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400" },
  store_assigned: { label: "Store Assigned", color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400" },
  driver_assigned: { label: "Driver Assigned", color: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400" },
  driver_arrived: { label: "Driver Arrived", color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400" },
  picked_up: { label: "Picked Up", color: "bg-teal-100 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400" },
  at_store: { label: "At Store", color: "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400" },
  stored: { label: "Stored", color: "bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400" },
  return_requested: { label: "Return Requested", color: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400" },
  return_driver_assigned: { label: "Return Driver Assigned", color: "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400" },
  out_for_return: { label: "Out for Return", color: "bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400" },
  arrived_for_delivery: { label: "Arrived for Delivery", color: "bg-lime-100 text-lime-700 dark:bg-lime-500/10 dark:text-lime-400" },
  delivered: { label: "Delivered", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400" },
  driver_cancelled_critical: { label: "Driver Cancelled", color: "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400" },
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
//  TAB 1: BOOKING DETAILS TAB
// ═══════════════════════════════════════════
const BookingDetailsTab = ({ booking }: { booking: any }) => {
  const statusCfg = STATUS_BADGE[booking.status] || { label: booking.status, color: "bg-slate-100 text-slate-700" };
  const currency = booking.pricing?.currency || "INR";
  const advBreakdown = booking.pricing?.advanceBreakdown || {};

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
        {booking.notes && <DetailRow label="Notes" value={booking.notes} />}
      </SectionCard>

      {/* Luggage Info */}
      <SectionCard title="Luggage & Item Breakdown" icon={<FaBoxOpen />}>
        {booking.luggage ? (
          <>
            <DetailRow label="Total Items" value={
              <span className="text-lg font-extrabold text-primary">{booking.luggage.totalCount}</span>
            } />
            <DetailRow label="Small Bags" value={booking.luggage.small ?? 0} />
            <DetailRow label="Medium Bags" value={booking.luggage.medium ?? 0} />
            <DetailRow label="Large Bags" value={booking.luggage.large ?? 0} />
            {booking.luggage.other > 0 && <DetailRow label="Other Items" value={booking.luggage.other} />}
          </>
        ) : (
          <p className="text-xs text-slate-400 py-2">No luggage information available</p>
        )}
      </SectionCard>

      {/* Luggage Photos (Driver / Store Uploads) */}
      <SectionCard title="Luggage & Verification Photos" icon={<FaCamera />}>
        {(() => {
          const pickupPhotos: string[] = booking.luggagePhotos?.pickup || booking.pickup?.photos || [];
          const storePhotos: string[] = booking.luggagePhotos?.store || booking.luggagePhotos?.storage || booking.storage?.photos || [];
          const deliveryPhotos: string[] = booking.luggagePhotos?.delivery || booking.delivery?.photos || [];
          const totalPhotos = pickupPhotos.length + storePhotos.length + deliveryPhotos.length;

          if (totalPhotos === 0) {
            return (
              <div className="py-4 text-center">
                <p className="text-xs text-slate-400">No luggage photos uploaded for this booking yet.</p>
              </div>
            );
          }

          return (
            <div className="space-y-4">
              {pickupPhotos.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                      Pickup Photos ({pickupPhotos.length})
                    </p>
                    <span className="text-[10px] text-slate-400">Driver Handover</span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                    {pickupPhotos.map((photo, idx) => {
                      const imgUrl = resolveImgUrl(photo);
                      return (
                        <a
                          key={idx}
                          href={imgUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-sm block"
                        >
                          <img
                            src={imgUrl}
                            alt={`Pickup luggage ${idx + 1}`}
                            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                          />
                          <span className="absolute bottom-1 left-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white">
                            P{idx + 1}
                          </span>
                          <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs">
                            <FaExpand />
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {storePhotos.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                      Storage Inward Photos ({storePhotos.length})
                    </p>
                    <span className="text-[10px] text-slate-400">Store Vault</span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                    {storePhotos.map((photo, idx) => {
                      const imgUrl = resolveImgUrl(photo);
                      return (
                        <a
                          key={idx}
                          href={imgUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-sm block"
                        >
                          <img
                            src={imgUrl}
                            alt={`Storage luggage ${idx + 1}`}
                            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                          />
                          <span className="absolute bottom-1 left-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white">
                            S{idx + 1}
                          </span>
                          <div className="absolute inset-0 bg-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs">
                            <FaExpand />
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {deliveryPhotos.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      Delivery Photos ({deliveryPhotos.length})
                    </p>
                    <span className="text-[10px] text-slate-400">Final Handover</span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                    {deliveryPhotos.map((photo, idx) => {
                      const imgUrl = resolveImgUrl(photo);
                      return (
                        <a
                          key={idx}
                          href={imgUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-sm block"
                        >
                          <img
                            src={imgUrl}
                            alt={`Delivery luggage ${idx + 1}`}
                            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                          />
                          <span className="absolute bottom-1 left-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white">
                            D{idx + 1}
                          </span>
                          <div className="absolute inset-0 bg-emerald-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs">
                            <FaExpand />
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })()}
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
          <p className="text-xs text-slate-400 py-2">Delivery location not set yet</p>
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
              <DetailRow label="Total Amount" value={
                <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                  {currency} {displayTotalAmount > 0 ? displayTotalAmount.toFixed(2) : "0.00"}
                </span>
              } />
              <DetailRow label="Per Hour Storage Rate" value={`${currency} ${booking.pricing.perHourRate ?? snapshot?.customerStorageHourlyRateMinor ? snapshot.customerStorageHourlyRateMinor / 100 : 0}`} />
              <DetailRow label="Distance Delivery Charge" value={`${currency} ${deliveryFee.toFixed(2)}`} />
              
              {/* Advance Breakdown Sub-table */}
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/30 space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Advance Breakdown</p>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Platform Fee</span>
                    <span>{currency} {platformFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Delivery Fee</span>
                    <span>{currency} {deliveryFee.toFixed(2)}</span>
                  </div>
                  {handlingFee > 0 && (
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Handling Fee</span>
                      <span>{currency} {handlingFee.toFixed(2)}</span>
                    </div>
                  )}
                  {packingFee > 0 && (
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Packing Fee</span>
                      <span>{currency} {packingFee.toFixed(2)}</span>
                    </div>
                  )}
                  {taxAmount > 0 && (
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Tax (GST)</span>
                      <span>{currency} {taxAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-700">
                    <span>Advance Total</span>
                    <span>{currency} {advanceTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

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

              {booking.payments && booking.payments.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/30 space-y-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Payment Transactions</p>
                  <div className="space-y-2">
                    {booking.payments.map((p: any, idx: number) => (
                      <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white uppercase">{p.type} Payment</p>
                          <p className="text-[10px] text-slate-400 font-mono">{p.razorpayPaymentId || p.razorpayOrderId || p._id}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {currency} {((p.amountMinor || p.amount * 100 || 0) / 100).toFixed(2)}
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
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════
//  TAB 2: USER DETAILS TAB
// ═══════════════════════════════════════════
const UserDetailsTab = ({ booking }: { booking: Booking }) => {
  const userIdStr = typeof booking.userId === "string" ? booking.userId : booking.userId?._id;
  
  // Fetch user's previous/all bookings
  const { data: userBookingsData, isLoading: userBookingsLoading } = useGetBookingsQuery(
    { userId: userIdStr, limit: 10 },
    { skip: !userIdStr }
  );

  const userBookings: Booking[] = userBookingsData?.data?.bookings || [];

  return (
    <div className="space-y-6">
      {/* User Profile Card */}
      <SectionCard title="Customer Profile" icon={<FaUser />}>
        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/30">
          <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center font-bold text-white text-2xl shadow-lg">
            {getUserName(booking).charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{getUserName(booking)}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{getUserField(booking, "email")}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              Account: {getUserField(booking, "account_status" as any) || "ACTIVE"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailRow label="First Name" value={getUserField(booking, "first_name")} />
          <DetailRow label="Last Name" value={getUserField(booking, "last_name")} />
          <DetailRow label="Email Address" value={getUserField(booking, "email")} />
          <DetailRow label="Phone Number" value={getUserField(booking, "phone")} />
          <DetailRow label="User ID" value={<span className="font-mono text-xs">{userIdStr}</span>} />
        </div>
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
            <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-100 dark:border-slate-700/30">
              <div className="h-14 w-14 rounded-2xl bg-pink-100 dark:bg-pink-500/10 flex items-center justify-center text-pink-600 dark:text-pink-400 shadow">
                <FaStore className="text-xl" />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-base">{store.store_name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Luggage Storage Facility</p>
              </div>
            </div>
            <DetailRow label="Store Name" value={store.store_name} />
            <DetailRow label="Contact Number" value={store.store_contact_number || "—"} />
            <DetailRow label="Capacity" value={`${store.current_capacity ?? 0} / ${store.max_capacity ?? 0}`} />
            <DetailRow label="Store ID" value={<span className="font-mono text-xs">{store._id}</span>} />

            {booking.storage && (
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/30">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Storage Timestamps</p>
                <DetailRow label="Stored At" value={formatDate(booking.storage.storedAt)} />
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
            <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-100 dark:border-slate-700/30">
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
const DriverDetailsTab = ({ booking, onRegenerateStatement, isRegenerating }: { booking: any; onRegenerateStatement: () => void; isRegenerating: boolean }) => {
  const pickupDriver = typeof booking.pickup?.assignment?.driverId === "object" ? booking.pickup.assignment.driverId : null;
  const returnDriver = typeof booking.delivery?.assignment?.driverId === "object" ? booking.delivery.assignment.driverId : null;
  const earnings = booking.earnings || [];

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
              <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-100 dark:border-slate-700/30">
                <div className="h-14 w-14 rounded-2xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow">
                  <FaTruck className="text-xl" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{getDriverName(booking.pickup.assignment)}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Pickup Driver</p>
                </div>
              </div>
              <DetailRow label="Phone Number" value={pickupDriver.phone || "—"} />
              <DetailRow label="Vehicle Model" value={pickupDriver.vehicle_details?.model || "—"} />
              <DetailRow label="Vehicle Number" value={pickupDriver.vehicle_details?.vehicle_number || "—"} />
              <DetailRow label="Assigned At" value={formatDate(booking.pickup.assignment.assignedAt)} />
              <DetailRow label="Accepted At" value={formatDate(booking.pickup.assignment.acceptedAt)} />
              <DetailRow label="Completed At" value={formatDate(booking.pickup.assignment.completedAt)} />
              <OtpBadge otp={booking.pickup.assignment.otp} label="Pickup OTP" color="bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400" />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <FaTruck className="text-3xl text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-xs font-medium text-slate-400">No pickup driver assigned</p>
            </div>
          )}
        </SectionCard>

        {/* Return / Delivery Driver */}
        <SectionCard title="Return / Delivery Driver Details" icon={<FaTruck />}>
          {returnDriver ? (
            <>
              <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-100 dark:border-slate-700/30">
                <div className="h-14 w-14 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow">
                  <FaTruck className="text-xl" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{getDriverName(booking.delivery.assignment)}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Return Driver</p>
                </div>
              </div>
              <DetailRow label="Phone Number" value={returnDriver.phone || "—"} />
              <DetailRow label="Vehicle Model" value={returnDriver.vehicle_details?.model || "—"} />
              <DetailRow label="Vehicle Number" value={returnDriver.vehicle_details?.vehicle_number || "—"} />
              <DetailRow label="Assigned At" value={formatDate(booking.delivery.assignment.assignedAt)} />
              <DetailRow label="Accepted At" value={formatDate(booking.delivery.assignment.acceptedAt)} />
              <DetailRow label="Completed At" value={formatDate(booking.delivery.assignment.completedAt)} />
              <OtpBadge otp={booking.delivery.assignment.returnOtp} label="Return OTP (Store → Driver)" color="bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400" />
              <OtpBadge otp={booking.delivery.assignment.otp} label="Delivery OTP (User → Driver)" color="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <FaTruck className="text-3xl text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-xs font-medium text-slate-400">No return driver assigned</p>
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
                      ₹{((e.grossAmountMinor || 0) / 100).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">
                      ₹{((e.commissionAmountMinor || 0) / 100).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{((e.netEarningMinor || 0) / 100).toFixed(2)}
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
//  TAB 5: TIMELINE TAB
// ═══════════════════════════════════════════
const TimelineTab = ({ booking }: { booking: Booking }) => {
  if (!booking.timeline || booking.timeline.length === 0) {
    return (
      <SectionCard>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FaClock className="text-4xl text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-sm font-medium text-slate-400 dark:text-slate-500">No timeline events recorded yet</p>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Chronological Booking Event History" icon={<FaClock />}>
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
                </div>
                {entry.note && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">{entry.note}</p>
                )}
                {entry.role && (
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider">
                    Updated By: {entry.role}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
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
      case "photos":
        return <LuggagePhotosTab booking={booking} />;
      case "user":
        return <UserDetailsTab booking={booking} />;
      case "store":
        return <StoreDetailsTab booking={booking} />;
      case "driver":
        return <DriverDetailsTab booking={booking} onRegenerateStatement={handleRegenerateStatement} isRegenerating={isRegenerating} />;
      case "timeline":
        return <TimelineTab booking={booking} />;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-background text-foreground">
      {/* ── Header ── */}
      <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700/50 bg-white dark:bg-[#1a2332] sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <FaArrowLeft className="text-slate-600 dark:text-slate-300" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white truncate">
                {booking.bookingCode || "Booking Details"}
              </h1>
              <span className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 ${statusCfg.color}`}>
                {statusCfg.label}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Created {formatDate(booking.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* ── Tabs Navigation ── */}
      <div className="px-6 bg-white dark:bg-[#1a2332] border-b border-slate-200 dark:border-slate-700/50 sticky top-[73px] z-10">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-all duration-200 cursor-pointer ${
                activeTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600"
              }`}
            >
              <span className="text-base">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div className="flex-1 px-6 py-6">
        {renderTabContent()}
      </div>

      {/* ── Quick Actions (sticky bottom) ── */}
      {(() => {
        const isCancelled = booking.status === "cancelled" || booking.status === "driver_cancelled_critical";
        const isDelivered = booking.status === "delivered";
        const isTerminal = isCancelled || isDelivered;

        if (isTerminal) {
          return (
            <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-[#1a2332] sticky bottom-0 text-center">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {isCancelled
                  ? "This booking has been cancelled. Status updates are disabled."
                  : "This booking has been delivered & completed. No further status updates available."}
              </p>
            </div>
          );
        }

        return (
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700/50 bg-white dark:bg-[#1a2332] sticky bottom-0 z-10 shadow-md">
            <div className="flex flex-wrap items-center gap-2">
              <RoleGuard allowedRoles={["SUPER_ADMIN", "ADMIN", "OPERATION_MANAGER", "CUSTOMER_SUPPORT"]}>
                {/* Stage relevant driver assignment */}
                {["created", "store_assigned", "driver_assigned"].includes(booking.status) && (
                  <button onClick={handleAssignDriver} className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer">
                    Assign Driver
                  </button>
                )}

                {["created", "store_assigned", "driver_assigned", "driver_arrived", "picked_up", "at_store"].includes(booking.status) && (
                  <button onClick={handleReassignDriver} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors cursor-pointer">
                    Reassign / Search Driver
                  </button>
                )}

                {booking.status === "driver_cancelled_critical" && (
                  <button onClick={handleApproveCriticalCancel} className="px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 transition-colors cursor-pointer">
                    Approve Critical Cancel
                  </button>
                )}

                {booking.status === "driver_assigned" && (
                  <button onClick={() => handleAction(markArrived, "Marked as Arrived")} className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-xs font-bold hover:bg-cyan-700 transition-colors cursor-pointer">
                    Mark Arrived
                  </button>
                )}

                {booking.status === "driver_arrived" && (
                  <button onClick={() => handleAction(markPickedUp, "Marked as Picked Up")} className="px-4 py-2 bg-teal-600 text-white rounded-lg text-xs font-bold hover:bg-teal-700 transition-colors cursor-pointer">
                    Mark Picked Up
                  </button>
                )}

                {["picked_up", "at_store"].includes(booking.status) && (
                  <button onClick={() => handleAction(markStored, "Marked as Stored")} className="px-4 py-2 bg-violet-600 text-white rounded-lg text-xs font-bold hover:bg-violet-700 transition-colors cursor-pointer">
                    Mark Stored
                  </button>
                )}

                {booking.status === "stored" && (
                  <button onClick={() => handleAction(requestReturn, "Return Requested")} className="px-4 py-2 bg-amber-500 text-white rounded-lg text-xs font-bold hover:bg-amber-600 transition-colors cursor-pointer">
                    Request Return
                  </button>
                )}

                {["stored", "return_requested"].includes(booking.status) && (
                  <button onClick={handleAssignReturnDriver} className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer">
                    Assign Return Driver
                  </button>
                )}

                {["return_driver_assigned", "out_for_return", "arrived_for_delivery"].includes(booking.status) && (
                  <button onClick={() => handleAction(markDelivered, "Marked as Delivered")} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer">
                    Mark Delivered
                  </button>
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
