import axios, { AxiosError, AxiosResponse } from "axios";
import { refreshToken } from "../api/auth";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || "/api/v1/admin",
  withCredentials: true,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// RESPONSE INTERCEPTOR
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError<any>) => {
    const originalRequest: any = error.config;
    // If unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      // If refresh already running, wait
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest));
      }
      isRefreshing = true;
      try {
        // Call refresh API refreshToken()
        await refreshToken();

        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);

        // Refresh failed → logout and clear cookies on the backend
        try {
          await api.post("/auth/logout");
        } catch (logoutError) {
          // ignore
        }

        if (typeof window !== "undefined") {
          const path = window.location.pathname;
          const isPublicRoute = ["/login", "/signup", "/forgot-password", "/reset-password"].some(p => path.startsWith(p));
          if (!isPublicRoute) {
            window.location.href = "/login";
          }
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
