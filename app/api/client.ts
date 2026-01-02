import { api } from "@/app/lib/axios";
import { User, UserUpdateData } from "../types/usermanager";
import { Driver, DriverUpdateData } from "../types/driver";
import { ApiResponse } from "../types/common";
import { Booking } from "../types/booking";
import { UserProfile } from "../types/profile";

// Profile API endpoints
export const profileApi = {
  getProfile: () => api.get("/admins/profile"),
  updateProfile: (data: Partial<UserProfile>) => api.put("/profile", data),
};

// Dashboard API endpoints
export const dashboardApi = {
  getSummary: () => api.get("/dashboard/summary"),
  getChart: ({ entity, range }: { entity: string; range: string }) =>
    api.get(`/dashboard/chart?entity=${entity}&range=${range}`),
};

// Booking API endpoints
export const bookingApi = {
  getBookings: (page: number = 1, limit: number = 10) =>
    api.get(`/booking?page=${page}&limit=${limit}`),

  updateBooking: (bookingId: string, payload: Partial<Booking>) =>
    api.put(`/booking/${bookingId}`, payload),
};

// User API endpoints
export const usersApi = {
  // Get Users
  getUsers: async (
    page: number = 1,
    limit: number = 10,
    status: string = "",
    search: string = "",
    role: string = "",
    department: string = ""
  ): Promise<ApiResponse> => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status }),
      ...(search && { search }),
      ...(role && { role }),
      ...(department && { department }),
    });

    const response = await api.get(`/users?${queryParams}`);
    return response.data;
  },

  // Get User by ID
  userById: async (id: string): Promise<ApiResponse> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Update User
  updateUser: async (
    data: UserUpdateData & { id: string }
  ): Promise<ApiResponse> => {
    const response = await api.put("/users/update", data);
    return response.data;
  },

  // Create User
  createUser: async (
    data: Omit<UserUpdateData, "id">
  ): Promise<ApiResponse> => {
    const response = await api.post("/users", data);
    return response.data;
  },

  // Delete Users
  deleteUsers: async (ids: string[]): Promise<void> => {
    await api.delete("/users/bulk-delete", {
      data: { ids },
    });
  },

  // Update User Status
  updateUserStatus: async (
    id: string,
    status: string
  ): Promise<ApiResponse> => {
    const response = await api.patch(`/users/${id}/status`, { status });
    return response.data;
  },

  // Reset User Password
  resetPassword: async (id: string): Promise<ApiResponse> => {
    const response = await api.post(`/users/${id}/reset-password`);
    return response.data;
  },

  // Export Users
  exportUsers: async (
    format: "csv" | "excel" = "csv"
  ): Promise<ApiResponse> => {
    const response = await api.get(`/users/export?format=${format}`, {
      responseType: "blob",
    });
    return response.data;
  },

  // Upload Users (Bulk)
  uploadUsers: async (file: File): Promise<ApiResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/users/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};

// Driver API endpoints
export const driverApi = {
  getDrivers: async (
    page: number = 1,
    limit: number = 10,
    status: string = "",
    search: string = ""
  ): Promise<{
    drivers: Driver[];
    total: number;
    page: number;
    limit: number;
  }> => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status }),
      ...(search && { search }),
    });

    const response = await api.get(`/driver?${queryParams}`);
    return response.data;
  },

  getDriverById: async (id: string): Promise<Driver> => {
    const response = await api.get(`/driver/${id}`);
    return response.data;
  },

  updateDriver: async (
    data: DriverUpdateData & { id: string }
  ): Promise<Driver> => {
    const response = await api.put<Driver>("/driver/update", data);
    return response.data;
  },
  deleteDrivers: async (ids: string[]): Promise<void> => {
    await api.delete("/drivers/bulk-delete", {
      data: { ids },
    });
  },

  updateDriverStatus: async (id: string, status: string): Promise<Driver> => {
    const response = await api.patch(`/drivers/${id}/status`, { status });
    return response.data;
  },
};
