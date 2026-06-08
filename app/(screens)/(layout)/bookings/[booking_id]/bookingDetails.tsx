"use client";

import { useEffect, useState } from "react";
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
  useMarkDeliveredMutation 
} from "../../../../services/bookingApi";
import { useToast } from "../../../../hooks/useToast";
import { RoleGuard } from "../../../../components/common/RoleGuard";
import { FaArrowLeft } from "react-icons/fa";

export default function BookingDetailsClient({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const toast = useToast();
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

  if (isLoading) return <div className="p-8">Loading booking details...</div>;
  if (isError || !data?.data) return <div className="p-8">Booking not found.</div>;

  const booking = data.data;

  // Placeholder for driver assignment modal. In a real app we'd fetch drivers and select one.
  const handleAssignDriver = () => {
    const driverId = prompt("Enter Driver ID to assign:");
    if (driverId) handleAction(assignDriver, "Driver assigned!", { bookingId, driverId });
  };

  const handleAssignReturnDriver = () => {
    const driverId = prompt("Enter Driver ID for return:");
    if (driverId) handleAction(assignReturnDriver, "Return Driver assigned!", { bookingId, driverId });
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-background text-foreground py-4 px-6 relative">
      <div className="flex items-center gap-4 py-4">
        <button onClick={() => router.back()} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200">
          <FaArrowLeft />
        </button>
        <h1 className="text-2xl font-bold">Booking Details: {booking.bookingId}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        <div className="bg-white dark:bg-[#232f48] p-6 rounded-xl border border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold mb-4">Customer Info</h2>
          <div className="flex gap-4 items-center">
            <div className="h-16 w-16 rounded-full bg-slate-200 bg-cover bg-center" style={{ backgroundImage: `url(${booking.userAvatar})` }} />
            <div>
              <p className="font-bold">{booking.userName}</p>
              <p className="text-sm text-slate-500">{booking.userEmail}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#232f48] p-6 rounded-xl border border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold mb-4">Booking Status</h2>
          <p className="mb-2"><strong>Status:</strong> <span className="capitalize px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">{booking.status}</span></p>
          <p><strong>Created At:</strong> {booking.bookingTime}</p>
        </div>
      </div>

      <div className="mt-8 bg-white dark:bg-[#232f48] p-6 rounded-xl border border-slate-200 dark:border-slate-800">
        <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <RoleGuard allowedRoles={["SUPER_ADMIN", "ADMIN", "OPERATION_MANAGER"]}>
             <button onClick={handleAssignDriver} className="px-4 py-2 bg-primary text-white rounded font-medium hover:bg-blue-700">Assign Driver</button>
             <button onClick={() => handleAction(markArrived, "Marked as Arrived")} className="px-4 py-2 bg-slate-200 text-black rounded font-medium hover:bg-slate-300">Mark Arrived</button>
             <button onClick={() => handleAction(markPickedUp, "Marked as Picked Up")} className="px-4 py-2 bg-slate-200 text-black rounded font-medium hover:bg-slate-300">Mark Picked Up</button>
             <button onClick={() => handleAction(markStored, "Marked as Stored")} className="px-4 py-2 bg-slate-200 text-black rounded font-medium hover:bg-slate-300">Mark Stored</button>
             <button onClick={() => handleAction(requestReturn, "Return Requested")} className="px-4 py-2 bg-amber-500 text-white rounded font-medium hover:bg-amber-600">Request Return</button>
             <button onClick={handleAssignReturnDriver} className="px-4 py-2 bg-primary text-white rounded font-medium hover:bg-blue-700">Assign Return Driver</button>
             <button onClick={() => handleAction(markDelivered, "Marked as Delivered")} className="px-4 py-2 bg-green-500 text-white rounded font-medium hover:bg-green-600">Mark Delivered</button>
             <button onClick={() => handleAction(cancelBooking, "Booking Cancelled")} className="px-4 py-2 bg-red-500 text-white rounded font-medium hover:bg-red-600">Cancel Booking</button>
          </RoleGuard>
        </div>
      </div>
    </div>
  );
}
