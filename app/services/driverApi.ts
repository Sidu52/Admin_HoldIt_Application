import { api } from "./api";

export const driverApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDrivers: builder.query<any, any>({
      query: (params) => ({
        url: "/driver",
        params,
      }),
      providesTags: (result) =>
        result && result.data && result.data.drivers
          ? [
              ...result.data.drivers.map(({ _id }: { _id: string }) => ({ type: "Driver" as const, id: _id })),
              { type: "Driver", id: "PARTIAL-LIST" },
            ]
          : [{ type: "Driver", id: "PARTIAL-LIST" }],
    }),
    getDriver: builder.query<any, string>({
      query: (driverId) => `/driver/${driverId}`,
      providesTags: (result, error, id) => [{ type: "Driver", id }],
    }),
    updateDriverInfo: builder.mutation<any, { driverId: string; data: any }>({
      query: ({ driverId, data }) => ({
        url: `/driver/${driverId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { driverId }) => [{ type: "Driver", id: driverId }, { type: "Driver", id: "PARTIAL-LIST" }],
    }),
    updateDriverLocation: builder.mutation<any, { driverId: string; lat: number; lng: number }>({
      query: ({ driverId, lat, lng }) => ({
        url: `/driver/${driverId}/location`,
        method: "PATCH",
        body: { lat, lng },
      }),
      invalidatesTags: (result, error, { driverId }) => [{ type: "Driver", id: driverId }, { type: "Driver", id: "PARTIAL-LIST" }],
    }),
    updateDriverAccount: builder.mutation<any, { driverId: string; data: any }>({
      query: ({ driverId, data }) => ({
        url: `/driver/${driverId}/account`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { driverId }) => [{ type: "Driver", id: driverId }, { type: "Driver", id: "PARTIAL-LIST" }],
    }),
    bulkDeactivateDrivers: builder.mutation<any, { driverIds: string[] }>({
      query: (data) => ({
        url: "/driver/bulk-deactivate",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Driver", id: "PARTIAL-LIST" }],
    }),
    updateDriverStatus: builder.mutation<any, { driverId: string; status: string; reason?: string; is_active?: boolean }>({
      query: ({ driverId, ...data }) => ({
        url: `/driver/${driverId}/status`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { driverId }) => [{ type: "Driver", id: driverId }, { type: "Driver", id: "PARTIAL-LIST" }],
    }),
  }),
});

export const {
  useGetDriversQuery,
  useGetDriverQuery,
  useUpdateDriverInfoMutation,
  useUpdateDriverLocationMutation,
  useUpdateDriverAccountMutation,
  useBulkDeactivateDriversMutation,
  useUpdateDriverStatusMutation,
} = driverApi;
