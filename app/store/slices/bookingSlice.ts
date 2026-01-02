import { createSlice } from "@reduxjs/toolkit";
import { Booking, Pagination } from "@/app/types/booking";
import { updateBookingThunk } from "../thunks/bookingThunks";

const initialState = {
  bookings: [] as Booking[],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 5,
  } as Pagination,
  bookingLoading: false,
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
  extraReducers: (builder) => {
    builder
      .addCase(updateBookingThunk.pending, (state) => {
        state.bookingLoading = true;
      })
      .addCase(updateBookingThunk.fulfilled, (state, action) => {
        state.bookingLoading = false;
        const index = state.bookings.findIndex(
          (b) => b.id === action.payload.id
        );
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
      })
      .addCase(updateBookingThunk.rejected, (state) => {
        state.bookingLoading = false;
      });
  },
});

export const { setBookings } = bookingSlice.actions;
export default bookingSlice.reducer;
