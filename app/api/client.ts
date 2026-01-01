import { api } from "@/app/lib/axios";
import { User } from "../types/usermanager";

// Dashboard API endpoints
export const dashboardApi = {
  getUserProfile: () => api.get("/admins/profile"),
  getSummary: () => api.get("/dashboard/summary"),
  getChart: ({ entity, range }: { entity: string; range: string }) =>
    api.get(`/dashboard/chart?entity=${entity}&range=${range}`),
};

// Booking API endpoints
export const bookingApi = {
  getBookings: (page: number = 1, limit: number = 10) =>
    api.get(`/bookings?page=${page}&limit=${limit}`),
};

// User API endpoints
export const usersApi = {
  // Get Users
  getUsers: (
    page: number = 1,
    limit: number = 10,
    status: string,
    search: string
  ) =>
    api.get(
      `/users?page=${page}&limit=${limit}&status=${status}&search=${search}`
    ),

  // Get User by ID
  userById: (id: string) => api.get(`/users/${id}`),

  // Update User
  updateUser: async (data: User) => {
    const response = await api.put<User>("/users/update", data);
    return response.data;
  },
};
