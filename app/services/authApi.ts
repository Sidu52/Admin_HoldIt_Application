import { api } from "./api";
import { AuthResponse, LoginCredentials, User } from "../types/auth";

export const authApi = api.injectEndpoints(
  {
    endpoints: (builder) => ({
      // Returns only the user object — tokens are set as HttpOnly cookies by the backend
      login: builder.mutation<AuthResponse, LoginCredentials>({
        query: (credentials) => ({
          url: "/auth/login",
          method: "POST",
          body: credentials,
        }),
        invalidatesTags: ["Admin", "Dashboard"],
      }),
      signup: builder.mutation<any, any>({
        query: (data) => ({
          url: "/auth/signup",
          method: "POST",
          body: data,
        }),
      }),
      verifyInvite: builder.query<any, string>({
        query: (token) => `/auth/verify-invite?token=${token}`,
      }),
      forgotPassword: builder.mutation<any, string>({
        query: (email) => ({
          url: "/auth/forgot-password",
          method: "POST",
          body: { email },
        }),
      }),
      verifyResetToken: builder.query<any, string>({
        query: (token) => `/auth/verify-reset-token?token=${token}`,
      }),
      resetPassword: builder.mutation<any, any>({
        query: (data) => ({
          url: "/auth/forgot-password/reset",
          method: "POST",
          body: data,
        }),
      }),
      // Verifies the session via the accessToken cookie — use this on app load
      verifySession: builder.query<User, void>({
        query: () => "/auth/verify",
      }),
      logoutApi: builder.mutation<any, void>({
        query: () => ({
          url: "/auth/logout",
          method: "POST",
        }),
      }),
      changePassword: builder.mutation<any, any>({
        query: (data) => ({
          url: "/auth/change-password",
          method: "PUT",
          body: data,
        }),
      }),
    }),
  }
);

export const {
  useLoginMutation,
  useSignupMutation,
  useVerifyInviteQuery,
  useForgotPasswordMutation,
  useVerifyResetTokenQuery,
  useResetPasswordMutation,
  useVerifySessionQuery,
  useLogoutApiMutation,
  useChangePasswordMutation,
} = authApi;
