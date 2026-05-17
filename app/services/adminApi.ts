import { api } from "./api";
import { User } from "../store/slices/authSlice";

export const adminApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query<User, void>({
      query: () => "/profile",
      providesTags: ["Admin"],
    }),
    updateProfile: builder.mutation<User, Partial<User>>({
      query: (data) => ({
        url: "/profile",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Admin"],
    }),
    getTeam: builder.query<any, any>({
      query: (params) => ({
        url: "/team",
        params,
      }),
      providesTags: ["Team"],
    }),
    getTeamMemberById: builder.query<any, string>({
      query: (id) => `/team/${id}`,
      providesTags: (result, error, id) => [{ type: "Team", id }],
    }),
    updateTeamMember: builder.mutation<any, { memberId: string; data: any }>({
      query: ({ memberId, data }) => ({
        url: `/team/${memberId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { memberId }) => [
        { type: "Team", id: memberId },
        "Team",
      ],
    }),
    getAdmins: builder.query<any, void>({
      query: () => "/admins",
      providesTags: ["Team"],
    }),
    getSuperAdmins: builder.query<any, void>({
      query: () => "/super-admins",
      providesTags: ["Team"],
    }),
    inviteTeamMember: builder.mutation<any, { email: string; role: string }>({
      query: (data) => ({
        url: "/invite",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Team"],
    }),
    updateAccountStatus: builder.mutation<any, { adminId: string; status: string }>({
      query: (data) => ({
        url: "/account-status",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Team"],
    }),
    deleteAdmins: builder.mutation<any, { adminIds: string[] }>({
      query: (data) => ({
        url: "/bulk-delete",
        method: "POST",
        body: { ids: data.adminIds, reason: "Admin bulk deactivation" },
      }),
      invalidatesTags: ["Team"],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useGetTeamQuery,
  useGetTeamMemberByIdQuery,
  useUpdateTeamMemberMutation,
  useGetAdminsQuery,
  useGetSuperAdminsQuery,
  useInviteTeamMemberMutation,
  useUpdateAccountStatusMutation,
  useDeleteAdminsMutation,
} = adminApi;
