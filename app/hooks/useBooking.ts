import { useQuery } from "@tanstack/react-query";
import { bookingApi } from "@/app/api/client";

// Get bookings
export const getBooking = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ["bookings", { page, limit }],
    queryFn: () => bookingApi.getBookings(page, limit),
  });
};
