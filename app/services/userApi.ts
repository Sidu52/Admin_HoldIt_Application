import { api } from "./api";

export const userApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<any, any>({
      query: (params) => ({
        url: "/users",
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
      query: (userId) => `/users/${userId}`,
      providesTags: (result, error, id) => [{ type: "User", id }],
    }),
    updateUser: builder.mutation<any, { userId: string; data: any }>({
      query: ({ userId, data }) => ({
        url: `/users/${userId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { userId }) => [{ type: "User", id: userId }, { type: "User", id: "PARTIAL-LIST" }],
    }),
    updateUserStatus: builder.mutation<any, { userId: string; status: string }>({
      query: ({ userId, status }) => ({
        url: `/users/${userId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { userId }) => [{ type: "User", id: userId }, { type: "User", id: "PARTIAL-LIST" }],
    }),
    bulkDeactivateUsers: builder.mutation<any, { userIds: string[] }>({
      query: (data) => ({
        url: "/users/bulk-delete",
        method: "POST",
        body: { ids: data.userIds, reason: "Admin bulk deactivation" },
      }),
      invalidatesTags: [{ type: "User", id: "PARTIAL-LIST" }],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserDetailsQuery,
  useUpdateUserMutation,
  useUpdateUserStatusMutation,
  useBulkDeactivateUsersMutation,
} = userApi;
