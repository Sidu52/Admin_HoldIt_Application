import { api } from "./api";

export const bookingApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getBookings: builder.query<any, any>({
      query: (params) => ({
        url: "/booking",
        params,
      }),
      providesTags: (result) =>
        result && result.data
          ? [...result.data.bookings.map(({ id }: { id: string }) => ({ type: "Booking" as const, id })), "Booking"]
          : ["Booking"],
    }),
    getBooking: builder.query<any, string>({
      query: (id) => `/booking/${id}`,
      providesTags: (result, error, id) => [{ type: "Booking", id }],
    }),
    cancelBooking: builder.mutation<any, string>({
      query: (id) => ({
        url: `/booking/${id}/cancel`,
        method: "PUT",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Booking", id }, "Booking"],
    }),
    assignDriver: builder.mutation<any, { bookingId: string; driverId: string }>({
      query: ({ bookingId, driverId }) => ({
        url: `/booking/${bookingId}/assign-driver`,
        method: "PATCH",
        body: { driverId },
      }),
      invalidatesTags: (result, error, { bookingId }) => [{ type: "Booking", id: bookingId }, "Booking"],
    }),
    reassignDriver: builder.mutation<any, { bookingId: string; driverId: string }>({
      query: ({ bookingId, driverId }) => ({
        url: `/booking/${bookingId}/reassign-driver`,
        method: "PATCH",
        body: { driverId },
      }),
      invalidatesTags: (result, error, { bookingId }) => [{ type: "Booking", id: bookingId }, "Booking"],
    }),
    reassignStore: builder.mutation<any, { bookingId: string; storeId: string }>({
      query: ({ bookingId, storeId }) => ({
        url: `/booking/${bookingId}/reassign-store`,
        method: "PATCH",
        body: { storeId },
      }),
      invalidatesTags: (result, error, { bookingId }) => [{ type: "Booking", id: bookingId }, "Booking"],
    }),
    assignReturnDriver: builder.mutation<any, { bookingId: string; driverId: string }>({
      query: ({ bookingId, driverId }) => ({
        url: `/booking/${bookingId}/assign-return-driver`,
        method: "PATCH",
        body: { driverId },
      }),
      invalidatesTags: (result, error, { bookingId }) => [{ type: "Booking", id: bookingId }, "Booking"],
    }),
    markArrived: builder.mutation<any, string>({
      query: (id) => ({
        url: `/booking/${id}/mark-arrived`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Booking", id }, "Booking"],
    }),
    markPickedUp: builder.mutation<any, string>({
      query: (id) => ({
        url: `/booking/${id}/mark-picked-up`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Booking", id }, "Booking"],
    }),
    markStored: builder.mutation<any, string>({
      query: (id) => ({
        url: `/booking/${id}/mark-stored`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Booking", id }, "Booking"],
    }),
    requestReturn: builder.mutation<any, string>({
      query: (id) => ({
        url: `/booking/${id}/request-return`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Booking", id }, "Booking"],
    }),
    markDelivered: builder.mutation<any, string>({
      query: (id) => ({
        url: `/booking/${id}/mark-delivered`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Booking", id }, "Booking"],
    }),
  }),
});

export const {
  useGetBookingsQuery,
  useGetBookingQuery,
  useCancelBookingMutation,
  useAssignDriverMutation,
  useReassignDriverMutation,
  useReassignStoreMutation,
  useAssignReturnDriverMutation,
  useMarkArrivedMutation,
  useMarkPickedUpMutation,
  useMarkStoredMutation,
  useRequestReturnMutation,
  useMarkDeliveredMutation,
} = bookingApi;
