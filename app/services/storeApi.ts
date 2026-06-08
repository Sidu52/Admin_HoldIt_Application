import { api } from "./api";

export const storeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getStores: builder.query<any, any>({
      query: (params) => ({
        url: "/store",
        params,
      }),
      providesTags: (result) => {
        const storesList = result && result.data ? (result.data.stores || result.data.store) : null;
        return storesList
          ? [
            ...storesList.map(({ _id }: { _id: string }) => ({ type: "Store" as const, id: _id })),
            { type: "Store", id: "PARTIAL-LIST" },
          ]
          : [{ type: "Store", id: "PARTIAL-LIST" }];
      },
    }),
    getStore: builder.query<any, string>({
      query: (storeId) => `/store/${storeId}`,
      providesTags: (result, error, id) => [{ type: "Store", id }],
    }),
    createStore: builder.mutation<any, Partial<any>>({
      query: (data) => ({
        url: "/store",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Store", id: "PARTIAL-LIST" }],
    }),
    updateStore: builder.mutation<any, { storeId: string; data: Partial<any> }>({
      query: ({ storeId, data }) => ({
        url: `/store/${storeId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { storeId }) => [{ type: "Store", id: storeId }, { type: "Store", id: "PARTIAL-LIST" }],
    }),
    toggleStoreDuty: builder.mutation<any, { storeId: string; is_online: boolean }>({
      query: ({ storeId, is_online }) => ({
        url: `/store/${storeId}/duty`,
        method: "PATCH",
        body: { is_online },
      }),
      async onQueryStarted({ storeId, is_online }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          storeApi.util.updateQueryData("getStore", storeId, (draft) => {
            if (draft) draft.is_online = is_online;
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (result, error, { storeId }) => [{ type: "Store", id: storeId }, { type: "Store", id: "PARTIAL-LIST" }],
    }),
    toggleStoreStatus: builder.mutation<any, { storeId: string; account_status: string; store_deactivated_reason: string }>({
      query: ({ storeId, account_status, store_deactivated_reason }) => ({
        url: `/store/${storeId}/status`,
        method: "PATCH",
        body: { account_status, store_deactivated_reason },
      }),
      async onQueryStarted({ storeId, account_status, store_deactivated_reason }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          storeApi.util.updateQueryData("getStore", storeId, (draft) => {
            if (draft) draft.account_status = account_status;
            if (draft) draft.store_deactivated_reason = store_deactivated_reason;
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (result, error, { storeId }) => [{ type: "Store", id: storeId }, { type: "Store", id: "PARTIAL-LIST" }],
    }),
    deleteStores: builder.mutation<any, { storeIds: string[] }>({
      query: ({ storeIds }) => ({
        url: `/store/bulk-delete`,
        method: "POST",
        body: { ids: storeIds, reason: "Admin bulk deactivation" },
      }),
      invalidatesTags: [{ type: "Store", id: "PARTIAL-LIST" }],
    }),
    updateLocation: builder.mutation<any, { storeId: string; lat: number, lng: number, address?: string }>(
      {
        query: ({ storeId, lat, lng, address }) => ({
          url: `/store/${storeId}/location`,
          method: "PATCH",
          body: { lat, lng, address },
        }),
        invalidatesTags: (result, error, { storeId }) => [{ type: "Store", id: storeId }, { type: "Store", id: "PARTIAL-LIST" }],
      }
    ),
  }),
});

export const {
  useGetStoresQuery,
  useGetStoreQuery,
  useCreateStoreMutation,
  useUpdateStoreMutation,
  useToggleStoreDutyMutation,
  useToggleStoreStatusMutation,
  useDeleteStoresMutation,
  useUpdateLocationMutation,
} = storeApi;
