"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useGetBookingQuery,
  useCancelBookingMutation,
  useAssignDriverMutation,
  useMarkArrivedMutation,
  useMarkPickedUpMutation,
  useMarkStoredMutation,
  useRequestReturnMutation,
  useAssignReturnDriverMutation,
  useMarkDeliveredMutation,
} from "../../../../services/bookingApi";
import { useToast } from "../../../../hooks/useToast";
import { RoleGuard } from "../../../../components/common/RoleGuard";
import {
  FaArrowLeft,
  FaBoxOpen,
  FaClipboardList,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaStore,
  FaTruck,
  FaUser,
  FaClock,
} from "react-icons/fa";
import { Booking, PopulatedUser, PopulatedStore, TimelineEntry } from "@/app/types/booking";

// ── Tabs ──
const TABS = [
  { key: "booking", label: "Booking Details", icon: <FaClipboardList /> },
  { key: "user", label: "User Details", icon: <FaUser /> },
  { key: "store", label: "Store Details", icon: <FaStore /> },
  { key: "driver", label: "Driver Details", icon: <FaTruck /> },
  { key: "timeline", label: "Booking TimeLine", icon: <FaClock /> },
] as const;

type TabKey = (typeof TABS)[number]["key"];

// ── Helpers ──
const getUserName = (userId: Booking["userId"]): string => {
  if (typeof userId === "string") return userId;
  return `${userId?.first_name || ""} ${userId?.last_name || ""}`.trim() || "—";
};

const getUserField = (userId: Booking["userId"], field: keyof PopulatedUser): string => {
  if (typeof userId === "string") return "—";
  return String((userId as PopulatedUser)?.[field] || "—");
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
  if (typeof assignment.driverId === "string") return assignment.driverId;
  const d = assignment.driverId;
  return `${d.first_name || ""} ${d.last_name || ""}`.trim() || "—";
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

// ── Status Badge ──
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

// ── Reusable UI Components ──
const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex justify-between items-start py-3 border-b border-slate-100 dark:border-slate-700/30 last:border-0">
    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider shrink-0">{label}</span>
    <span className="text-sm font-medium text-slate-900 dark:text-white text-right max-w-[60%] break-words">{value || "—"}</span>
  </div>
);

const SectionCard = ({ title, children }: { title?: string; children: React.ReactNode }) => (
  <div className="bg-white dark:bg-[#1a2332] rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm overflow-hidden">
    {title && (
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700/30">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">{title}</h3>
      </div>
    )}
    <div className="px-6 py-4">{children}</div>
  </div>
);

// ═══════════════════════════════════════════
//  TAB CONTENT COMPONENTS
// ═══════════════════════════════════════════

const BookingDetailsTab = ({ booking }: { booking: Booking }) => {
  const statusCfg = STATUS_BADGE[booking.status] || { label: booking.status, color: "bg-slate-100 text-slate-700" };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* General Info */}
      <SectionCard title="General Information">
        <DetailRow label="Booking Code" value={<span className="font-mono font-bold">{booking.bookingCode}</span>} />
        <DetailRow label="Status" value={
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusCfg.color}`}>{statusCfg.label}</span>
        } />
        <DetailRow label="Created At" value={formatDate(booking.createdAt)} />
        <DetailRow label="Updated At" value={formatDate(booking.updatedAt)} />
        {booking.notes && <DetailRow label="Notes" value={booking.notes} />}
      </SectionCard>

      {/* Luggage */}
      <SectionCard title="Luggage Information">
        {booking.luggage ? (
          <>
            <DetailRow label="Total Items" value={
              <span className="text-lg font-extrabold text-primary">{booking.luggage.totalCount}</span>
            } />
            <DetailRow label="Small" value={booking.luggage.small} />
            <DetailRow label="Medium" value={booking.luggage.medium} />
            <DetailRow label="Large" value={booking.luggage.large} />
            {booking.luggage.other > 0 && <DetailRow label="Other" value={booking.luggage.other} />}
          </>
        ) : (
          <p className="text-sm text-slate-400 py-2">No luggage information available</p>
        )}
      </SectionCard>

      {/* Locations */}
      <SectionCard title="Pickup Location">
        <DetailRow label="Address" value={booking.pickupLocation?.address || "—"} />
        {booking.pickupLocation && (
          <DetailRow label="Coordinates" value={`${booking.pickupLocation.lat}, ${booking.pickupLocation.lng}`} />
        )}
      </SectionCard>

      <SectionCard title="Delivery Location">
        {booking.deliveryLocation ? (
          <>
            <DetailRow label="Address" value={booking.deliveryLocation.address || "—"} />
            <DetailRow label="Coordinates" value={`${booking.deliveryLocation.lat}, ${booking.deliveryLocation.lng}`} />
          </>
        ) : (
          <p className="text-sm text-slate-400 py-2">Not set yet</p>
        )}
      </SectionCard>

      {/* Pricing & Payment */}
      {booking.pricing && (
        <SectionCard title="Pricing">
          <DetailRow label="Total Amount" value={
            <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
              {booking.pricing.currency || "INR"} {booking.pricing.totalAmount ?? "—"}
            </span>
          } />
          <DetailRow label="Per Hour Rate" value={booking.pricing.perHourRate ?? "—"} />
          <DetailRow label="Storage Hours" value={booking.pricing.storageHours ?? "—"} />
          <DetailRow label="Distance Charge" value={booking.pricing.distanceCharge ?? "—"} />
        </SectionCard>
      )}

      {booking.payment && (
        <SectionCard title="Payment">
          <DetailRow label="Payment Status" value={
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              booking.payment.status === "paid" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" :
              booking.payment.status === "failed" ? "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400" :
              booking.payment.status === "refunded" ? "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400" :
              "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
            }`}>
              {(booking.payment.status || "pending").toUpperCase()}
            </span>
          } />
          {booking.payment.paidAt && <DetailRow label="Paid At" value={formatDate(booking.payment.paidAt)} />}
          {booking.payment.transactionId && <DetailRow label="Transaction ID" value={
            <span className="font-mono text-xs">{booking.payment.transactionId}</span>
          } />}
        </SectionCard>
      )}
    </div>
  );
};

const UserDetailsTab = ({ booking }: { booking: Booking }) => (
  <div className="max-w-xl">
    <SectionCard>
      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/30">
        <div className="h-16 w-16 rounded-2xl bg-[#1a2332] flex items-center justify-center font-bold text-white text-xl shadow-lg">
          {typeof booking.userId !== "string"
            ? (booking.userId?.first_name?.charAt(0) || "?").toUpperCase()
            : "?"}
        </div>
        <div>
          <p className="text-lg font-bold text-slate-900 dark:text-white">{getUserName(booking.userId)}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{getUserField(booking.userId, "email")}</p>
        </div>
      </div>
      <DetailRow label="First Name" value={getUserField(booking.userId, "first_name")} />
      <DetailRow label="Last Name" value={getUserField(booking.userId, "last_name")} />
      <DetailRow label="Email" value={getUserField(booking.userId, "email")} />
      <DetailRow label="Phone" value={getUserField(booking.userId, "phone")} />
      <DetailRow label="User ID" value={
        <span className="font-mono text-xs">{typeof booking.userId === "string" ? booking.userId : booking.userId?._id}</span>
      } />
    </SectionCard>
  </div>
);

const StoreDetailsTab = ({ booking }: { booking: Booking }) => (
  <div className="max-w-xl">
    <SectionCard>
      {booking.storeId && typeof booking.storeId !== "string" ? (
        <>
          <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/30">
            <div className="h-16 w-16 rounded-2xl bg-pink-100 dark:bg-pink-500/10 flex items-center justify-center text-pink-600 dark:text-pink-400 shadow-lg">
              <FaStore className="text-2xl" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{getStoreName(booking.storeId)}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Assigned Store</p>
            </div>
          </div>
          <DetailRow label="Store Name" value={getStoreField(booking.storeId, "store_name")} />
          <DetailRow label="Contact Number" value={getStoreField(booking.storeId, "store_contact_number")} />
          <DetailRow label="Store ID" value={
            <span className="font-mono text-xs">{getStoreField(booking.storeId, "_id")}</span>
          } />
          {booking.storage && (
            <>
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/30">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Storage Info</p>
              </div>
              <DetailRow label="Stored At" value={formatDate(booking.storage.storedAt)} />
              <DetailRow label="Expected Duration" value={booking.storage.expectedDurationHours ? `${booking.storage.expectedDurationHours} hours` : "—"} />
              <DetailRow label="Released At" value={formatDate(booking.storage.releasedAt)} />
            </>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FaStore className="text-4xl text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-sm font-medium text-slate-400 dark:text-slate-500">No store assigned yet</p>
        </div>
      )}
    </SectionCard>
  </div>
);

const DriverDetailsTab = ({ booking }: { booking: Booking }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {/* Pickup Driver */}
    <SectionCard title="Pickup Driver">
      {booking.pickup?.assignment?.driverId ? (
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
          <DetailRow label="Assigned At" value={formatDate(booking.pickup.assignment.assignedAt)} />
          <DetailRow label="Accepted At" value={formatDate(booking.pickup.assignment.acceptedAt)} />
          <DetailRow label="Started At" value={formatDate(booking.pickup.assignment.startedAt)} />
          <DetailRow label="Completed At" value={formatDate(booking.pickup.assignment.completedAt)} />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <FaTruck className="text-3xl text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-sm font-medium text-slate-400 dark:text-slate-500">No pickup driver assigned</p>
        </div>
      )}
      {booking.pickup?.scheduledAt && (
        <DetailRow label="Scheduled At" value={formatDate(booking.pickup.scheduledAt)} />
      )}
    </SectionCard>

    {/* Delivery / Return Driver */}
    <SectionCard title="Return / Delivery Driver">
      {booking.delivery?.assignment?.driverId ? (
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
          <DetailRow label="Assigned At" value={formatDate(booking.delivery.assignment.assignedAt)} />
          <DetailRow label="Accepted At" value={formatDate(booking.delivery.assignment.acceptedAt)} />
          <DetailRow label="Started At" value={formatDate(booking.delivery.assignment.startedAt)} />
          <DetailRow label="Completed At" value={formatDate(booking.delivery.assignment.completedAt)} />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <FaTruck className="text-3xl text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-sm font-medium text-slate-400 dark:text-slate-500">No return driver assigned</p>
        </div>
      )}
      {booking.delivery?.scheduledAt && (
        <DetailRow label="Scheduled At" value={formatDate(booking.delivery.scheduledAt)} />
      )}
      {booking.delivery?.requestedAt && (
        <DetailRow label="Return Requested At" value={formatDate(booking.delivery.requestedAt)} />
      )}
    </SectionCard>
  </div>
);

const TimelineTab = ({ booking }: { booking: Booking }) => {
  if (!booking.timeline || booking.timeline.length === 0) {
    return (
      <SectionCard>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FaClock className="text-4xl text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-sm font-medium text-slate-400 dark:text-slate-500">No timeline events yet</p>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard>
      <div className="space-y-0">
        {booking.timeline.map((entry: TimelineEntry, i: number) => {
          const statusCfg = STATUS_BADGE[entry.status] || { label: entry.status, color: "bg-slate-100 text-slate-700" };
          return (
            <div key={i} className="flex gap-4 relative">
              {/* Connector */}
              <div className="flex flex-col items-center">
                <div className={`w-3.5 h-3.5 rounded-full border-[3px] border-white dark:border-[#1a2332] shadow-sm z-10 ${
                  i === 0 ? "bg-primary" : "bg-slate-300 dark:bg-slate-600"
                }`} />
                {i < booking.timeline!.length - 1 && (
                  <div className="w-0.5 flex-1 bg-slate-200 dark:bg-slate-700 min-h-[40px]" />
                )}
              </div>

              {/* Content */}
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
                    By: {entry.role}
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
//  MAIN COMPONENT
// ═══════════════════════════════════════════
export default function BookingDetailsClient({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<TabKey>("booking");

  const { data, isLoading, isError } = useGetBookingQuery(bookingId);

  const [cancelBooking] = useCancelBookingMutation();
  const [assignDriver] = useAssignDriverMutation();
  const [markArrived] = useMarkArrivedMutation();
  const [markPickedUp] = useMarkPickedUpMutation();
  const [markStored] = useMarkStoredMutation();
  const [requestReturn] = useRequestReturnMutation();
  const [assignReturnDriver] = useAssignReturnDriverMutation();
  const [markDelivered] = useMarkDeliveredMutation();

  const handleAction = async (actionFn: any, successMessage: string, params?: any) => {
    try {
      await actionFn(params || bookingId).unwrap();
      toast.success(successMessage);
    } catch {
      toast.error("Action failed");
    }
  };

  if (isLoading) return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">Loading booking details...</p>
      </div>
    </div>
  );

  if (isError || !data?.data) return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center">
        <p className="text-lg font-bold text-slate-900 dark:text-white mb-2">Booking not found</p>
        <button onClick={() => router.back()} className="text-primary font-medium hover:underline cursor-pointer">Go back</button>
      </div>
    </div>
  );

  const booking: Booking = data.data;
  const statusCfg = STATUS_BADGE[booking.status] || { label: booking.status, color: "bg-slate-100 text-slate-700" };

  const handleAssignDriver = () => {
    const driverId = prompt("Enter Driver ID to assign:");
    if (driverId) handleAction(assignDriver, "Driver assigned!", { bookingId, driverId });
  };

  const handleAssignReturnDriver = () => {
    const driverId = prompt("Enter Driver ID for return:");
    if (driverId) handleAction(assignReturnDriver, "Return Driver assigned!", { bookingId, driverId });
  };

  // Tab content renderer
  const renderTabContent = () => {
    switch (activeTab) {
      case "booking":
        return <BookingDetailsTab booking={booking} />;
      case "user":
        return <UserDetailsTab booking={booking} />;
      case "store":
        return <StoreDetailsTab booking={booking} />;
      case "driver":
        return <DriverDetailsTab booking={booking} />;
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
      <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700/50 bg-white dark:bg-[#1a2332] sticky bottom-0">
        <div className="flex flex-wrap gap-2">
          <RoleGuard allowedRoles={["SUPER_ADMIN", "ADMIN", "OPERATION_MANAGER"]}>
            <button onClick={handleAssignDriver} className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer">Assign Driver</button>
            <button onClick={() => handleAction(markArrived, "Marked as Arrived")} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer">Mark Arrived</button>
            <button onClick={() => handleAction(markPickedUp, "Marked as Picked Up")} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer">Mark Picked Up</button>
            <button onClick={() => handleAction(markStored, "Marked as Stored")} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer">Mark Stored</button>
            <button onClick={() => handleAction(requestReturn, "Return Requested")} className="px-4 py-2 bg-amber-500 text-white rounded-lg text-xs font-bold hover:bg-amber-600 transition-colors cursor-pointer">Request Return</button>
            <button onClick={handleAssignReturnDriver} className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer">Assign Return Driver</button>
            <button onClick={() => handleAction(markDelivered, "Marked as Delivered")} className="px-4 py-2 bg-green-500 text-white rounded-lg text-xs font-bold hover:bg-green-600 transition-colors cursor-pointer">Mark Delivered</button>
            <button onClick={() => handleAction(cancelBooking, "Booking Cancelled")} className="px-4 py-2 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition-colors cursor-pointer">Cancel</button>
          </RoleGuard>
        </div>
      </div>
    </div>
  );
}
