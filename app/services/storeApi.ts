import { api } from "./api";

export const storeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getStores: builder.query<any, any>({
      query: (params) => ({
        url: "/stores",
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
      query: (storeId) => `/stores/${storeId}`,
      providesTags: (result, error, id) => [{ type: "Store", id }],
    }),
    createStore: builder.mutation<any, Partial<any>>({
      query: (data) => ({
        url: "/stores",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Store", id: "PARTIAL-LIST" }],
    }),
    updateStore: builder.mutation<any, { storeId: string; data: Partial<any> }>({
      query: ({ storeId, data }) => ({
        url: `/stores/${storeId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { storeId }) => [{ type: "Store", id: storeId }, { type: "Store", id: "PARTIAL-LIST" }],
    }),
    toggleStoreDuty: builder.mutation<any, { storeId: string; isOnline: boolean }>({
      query: ({ storeId, isOnline }) => ({
        url: `/stores/${storeId}/duty`,
        method: "PATCH",
        body: { isOnline },
      }),
      async onQueryStarted({ storeId, isOnline }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          storeApi.util.updateQueryData("getStore", storeId, (draft) => {
            if (draft) draft.isOnline = isOnline;
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
    toggleStoreStatus: builder.mutation<any, { storeId: string; status: string }>({
      query: ({ storeId, status }) => ({
        url: `/stores/${storeId}/status`,
        method: "PATCH",
        body: { status },
      }),
      async onQueryStarted({ storeId, status }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          storeApi.util.updateQueryData("getStore", storeId, (draft) => {
            if (draft) draft.status = status;
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
    toggleStoreVerification: builder.mutation<any, { storeId: string; isVerified: boolean }>({
      query: ({ storeId, isVerified }) => ({
        url: `/stores/${storeId}/verification`,
        method: "PATCH",
        body: { isVerified },
      }),
      async onQueryStarted({ storeId, isVerified }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          storeApi.util.updateQueryData("getStore", storeId, (draft) => {
            if (draft) draft.isVerified = isVerified;
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
        url: `/stores/bulk-delete`,
        method: "POST",
        body: { ids: storeIds, reason: "Admin bulk deactivation" },
      }),
      invalidatesTags: [{ type: "Store", id: "PARTIAL-LIST" }],
    }),
  }),
});

export const {
  useGetStoresQuery,
  useGetStoreQuery,
  useCreateStoreMutation,
  useUpdateStoreMutation,
  useToggleStoreDutyMutation,
  useToggleStoreStatusMutation,
  useToggleStoreVerificationMutation,
  useDeleteStoresMutation,
} = storeApi;
