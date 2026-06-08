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
    updateDriverLocation: builder.mutation<any, { driverId: string; lat: number; lng: number, address?: string }>({
      query: ({ driverId, lat, lng, address }) => ({
        url: `/driver/${driverId}/location`,
        method: "PATCH",
        body: { lat, lng, address },
      }),
      invalidatesTags: (result, error, { driverId }) => [{ type: "Driver", id: driverId }, { type: "Driver", id: "PARTIAL-LIST" }],
    }),
    bulkDeactivateDrivers: builder.mutation<any, { driverIds: string[] }>({
      query: (data) => ({
        url: "/driver/bulk-delete",
        method: "POST",
        body: { ids: data.driverIds, reason: "Admin bulk deactivation" },
      }),
      invalidatesTags: [{ type: "Driver", id: "PARTIAL-LIST" }],
    }),
    updateDriverStatus: builder.mutation<any, { driverId: string; account_status: string; account_deactivated_reason?: string }>({
      query: ({ driverId, ...data }) => ({
        url: `/driver/${driverId}/status`,
        method: "PATCH",
        body: data,
      }),
      async onQueryStarted({ driverId, account_status, account_deactivated_reason }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          driverApi.util.updateQueryData("getDriver", driverId, (draft) => {
            if (draft) {
              if (account_status) draft.account_status = account_status;
              if (account_deactivated_reason) draft.account_deactivated_reason = account_deactivated_reason;
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (result, error, { driverId }) => [{ type: "Driver", id: driverId }, { type: "Driver", id: "PARTIAL-LIST" }],
    }),
  }),
});

export const {
  useGetDriversQuery,
  useGetDriverQuery,
  useUpdateDriverInfoMutation,
  useUpdateDriverLocationMutation,
  useBulkDeactivateDriversMutation,
  useUpdateDriverStatusMutation,
} = driverApi;
