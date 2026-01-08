import { api } from "../lib/axios";
import { Booking } from "../types/booking";

// Booking API endpoints
const bookingApi = {
  getBookings: async (
    page: number = 1,
    limit: number = 10
  ) => {
    const res = await api.get("/booking", {
      params: { page, limit },
    });
    return res.data;
  },

  updateBooking: async (
    bookingId: string,
    payload: Partial<Booking>
  ) => {
    const res = await api.put(`/booking/${bookingId}`, payload);
    return res.data;
  },
};
export default bookingApi;