import { createAsyncThunk } from "@reduxjs/toolkit";
import { bookingApi } from "@/app/api/client";
import { Booking } from "@/app/types/booking";

export const fetchBookings = createAsyncThunk(
  "dashboard/fetchBookings",
  async (_, { rejectWithValue }) => {
    try {
      const res = await bookingApi.getBookings();
      return res.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch bookings"
      );
    }
  }
);

export const updateBookingThunk = createAsyncThunk<
  Booking,
  { bookingId: string; data: Partial<Booking> }
>("booking/updateBooking", async ({ bookingId, data }, { rejectWithValue }) => {
  try {
    const res = await bookingApi.updateBooking(bookingId, data);
    return res.data.data; // adjust based on API response
  } catch (err: any) {
    return rejectWithValue(err.response?.data || "Update failed");
  }
});
