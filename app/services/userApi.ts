import { api } from "./api";

export const userApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<any, any>({
      query: (params) => ({
        url: "/user",
        params,
      }),
      providesTags: (result) =>
        result && result.data
          ? [
            ...result.data.users.map(({ id }: { id: string }) => ({ type: "User" as const, id })),
            { type: "User", id: "PARTIAL-LIST" },
          ]
          : [{ type: "User", id: "PARTIAL-LIST" }],
    }),
    getUserDetails: builder.query<any, string>({
      query: (userId) => `/user/${userId}`,
      providesTags: (result, error, id) => [{ type: "User", id }],
    }),
    updateUser: builder.mutation<any, { userId: string; data: any }>({
      query: ({ userId, data }) => ({
        url: `/user/${userId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { userId }) => [{ type: "User", id: userId }, { type: "User", id: "PARTIAL-LIST" }],
    }),
    updateUserStatus: builder.mutation<any, { userId: string; account_status: string; reason?: string }>({
      query: ({ userId, account_status, reason }) => ({
        url: `/user/${userId}/status`,
        method: "PATCH",
        body: {
          account_status,
          reason,
        },
      }),
      async onQueryStarted({ userId, account_status, reason }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          userApi.util.updateQueryData("getUserDetails", userId, (draft) => {
            if (draft) {
              draft.account_status = account_status;
              draft.reason = reason;
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (result, error, { userId }) => [{ type: "User", id: userId }, { type: "User", id: "PARTIAL-LIST" }],
    }),
    bulkDeactivateUsers: builder.mutation<any, { userIds: string[] }>({
      query: (data) => ({
        url: "/user/bulk-delete",
        method: "DELETE",
        body: { ids: data.userIds, reason: "Admin bulk deactivation" },
      }),
      invalidatesTags: [{ type: "User", id: "PARTIAL-LIST" }],
    }),

    // Addrss
    addNewAddress: builder.mutation<any, any>({
      query: ({ userId, address }) => ({
        url: `/user/${userId}/addresses`,
        method: "POST",
        body: address,
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: "User", id: userId },           // ← add this
        { type: "User", id: "PARTIAL-LIST" },
      ],
    }),
    updateAddress: builder.mutation<any, any>({
      query: ({ userId, addressId, address }) => ({
        url: `/user/${userId}/addresses/${addressId}`,
        method: "PUT",
        body: address,
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: "User", id: userId },           // ← add this
        { type: "User", id: "PARTIAL-LIST" },
      ],
    }),
    deleteAddress: builder.mutation<any, any>({
      query: (data) => ({
        url: `/user/${data.userId}/addresses/${data.addressId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: "User", id: userId },           // ← add this
        { type: "User", id: "PARTIAL-LIST" },
      ],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserDetailsQuery,
  useUpdateUserMutation,
  useUpdateUserStatusMutation,
  useBulkDeactivateUsersMutation,
  useAddNewAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
} = userApi;
