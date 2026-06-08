import { api } from "./api";

export const storeOwnerApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getStoreOwners: builder.query<any, any>({
      query: (params) => ({
        url: "/storeowner",
        params,
      }),
      providesTags: (result) =>
        result && result.data && result.data.owners
          ? [
            ...result.data.owners.map(({ _id }: { _id: string }) => ({ type: "StoreOwner" as const, id: _id })),
            { type: "StoreOwner", id: "PARTIAL-LIST" },
          ]
          : [{ type: "StoreOwner", id: "PARTIAL-LIST" }],
    }),
    getStoreOwner: builder.query<any, string>({
      query: (ownerId) => `/storeowner/${ownerId}`,
      providesTags: (result, error, id) => [{ type: "StoreOwner", id }],
    }),
    createStoreOwner: builder.mutation<any, Partial<any>>({
      query: (data) => ({
        url: "/storeowner",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "StoreOwner", id: "PARTIAL-LIST" }],
    }),
    updateStoreOwner: builder.mutation<any, { ownerId: string; data: Partial<any> }>({
      query: ({ ownerId, data }) => ({
        url: `/storeowner/${ownerId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { ownerId }) => [{ type: "StoreOwner", id: ownerId }, { type: "StoreOwner", id: "PARTIAL-LIST" }],
    }),
    updateStoreOwnerStatus: builder.mutation<any, { ownerId: string; account_status: string; account_deactivated_reason: string }>({
      query: ({ ownerId, account_status, account_deactivated_reason }) => ({
        url: `/storeowner/${ownerId}/status`,
        method: "PATCH",
        body: {
          account_status,
          account_deactivated_reason,
        },
      }),
      async onQueryStarted({ ownerId, account_status, account_deactivated_reason }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          storeOwnerApi.util.updateQueryData("getStoreOwner", ownerId, (draft) => {
            if (draft) {
              draft.account_status = account_status;
              if (account_deactivated_reason !== undefined) draft.account_deactivated_reason = account_deactivated_reason;
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (result, error, { ownerId }) => [{ type: "StoreOwner", id: ownerId }, { type: "StoreOwner", id: "PARTIAL-LIST" }],
    }),
    deleteStoreOwners: builder.mutation<any, { ownerIds: string[] }>({
      query: ({ ownerIds }) => ({
        url: `/storeowner/bulk-delete`,
        method: "DELETE",
        body: { ids: ownerIds, reason: "Admin bulk deactivation" },
      }),
      invalidatesTags: [{ type: "StoreOwner", id: "PARTIAL-LIST" }],
    }),
  }),
});

export const {
  useGetStoreOwnersQuery,
  useGetStoreOwnerQuery,
  useCreateStoreOwnerMutation,
  useUpdateStoreOwnerMutation,
  useUpdateStoreOwnerStatusMutation,
  useDeleteStoreOwnersMutation,
} = storeOwnerApi;
