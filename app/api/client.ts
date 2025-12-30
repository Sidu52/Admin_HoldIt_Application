import { api } from "@/app/lib/axios";

// Example API calls for dashboard
export const dashboardApi = {
  // getStats: () => api.get('/dashboard/stats'),
  // getUsers: (page: number = 1, limit: number = 10) =>
  //   api.get(`/users?page=${page}&limit=${limit}`),
  // getUser: (id: string) => api.get(`/users/${id}`),
  // createUser: (data: any) => api.post('/users', data),
  // updateUser: (id: string, data: any) => api.put(`/users/${id}`, data),
  // deleteUser: (id: string) => api.delete(`/users/${id}`),
  getUserProfile: () => api.get("/admins/profile"),
};
