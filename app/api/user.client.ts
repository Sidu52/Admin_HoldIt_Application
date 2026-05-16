import { api } from "../lib/axios";
import { UpdateUserStatusData, UserUpdateData } from "../types/user";

// User API endpoints
const usersApi = {
  getUsers: async ({
    page,
    limit,
    status,
    search,
  }: {
    page: number;
    limit: number;
    status: string;
    search: string;
  }) => {
    const res = await api.get("/user", {
      params: { page, limit, status, search },
    });
    return res.data;
  },

  userById: async (id: string) => {
    const res = await api.get(`/user/${id}`);
    return res.data;
  },

  updateUser: async (data: UserUpdateData & { id: string }) => {
    const { id, ...rest } = data;
    const res = await api.put(`/user/${id}`, rest);
    return res.data;
  },

  deleteUsers: async (ids: string[]) => {
    await api.delete("/user/bulk-delete", {
      data: { ids },
    });
  },

  updateUserStatus: async (data: UpdateUserStatusData & { id: string }) => {
    const { id, ...rest } = data;
    const res = await api.patch(`/user/${id}/status`, { ...rest });
    return res.data;
  },
};

export default usersApi;
