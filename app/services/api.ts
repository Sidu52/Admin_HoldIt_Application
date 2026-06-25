import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { logout } from "../store/slices/authSlice";
import { Mutex } from "async-mutex";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "/api/v1/admin";
//                                                     ↑ direct to backend, not proxied

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  credentials: "include",
});

const mutex = new Mutex();

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  await mutex.waitForUnlock();
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      try {
        const refreshResult = await baseQuery(
          { url: "/auth/refresh", method: "POST" },
          api,
          extraOptions
        );

        if (refreshResult.data) {
          result = await baseQuery(args, api, extraOptions);
        } else {
          api.dispatch(logout());
          // Clear HttpOnly cookies on the backend before redirecting to prevent a redirect loop
          await baseQuery(
            { url: "/auth/logout", method: "POST" },
            api,
            extraOptions
          );
          if (typeof window !== "undefined") {
            const path = window.location.pathname;
            const isPublicRoute = ["/login", "/signup", "/forgot-password", "/reset-password"].some(p => path.startsWith(p));
            if (!isPublicRoute) {
              window.location.href = "/login";
            }
          }
        }
      } finally {
        release();
      }
    } else {
      await mutex.waitForUnlock();
      result = await baseQuery(args, api, extraOptions);
    }
  }

  return result;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User", "Store", "StoreOwner", "Driver", "Booking", "ServiceableArea", "Admin", "Team", "Dashboard"],
  endpoints: () => ({}),
});