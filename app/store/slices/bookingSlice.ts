import { createSlice } from "@reduxjs/toolkit";
import { Booking, Pagination } from "@/app/types/booking";

const initialState = {
  bookings: [] as Booking[],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 5,
  } as Pagination,
};

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    setBookings(state, action) {
      state.bookings = action.payload.bookings;
      state.pagination = action.payload.pagination;
    },
  },
});

export const { setBookings } = bookingSlice.actions;
export default bookingSlice.reducer;
