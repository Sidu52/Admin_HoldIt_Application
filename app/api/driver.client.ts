import { api } from "../lib/axios";
import { DriverUpdateData, UpdateDriverStatusData } from "../types/driver";

// Driver API endpoints
const driverApi = {
  getDrivers: async({
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
    const res = await api.get("/driver", {
      params: { page, limit, status, search },
    });
    return res.data;
  },

  getDriverById: async (id: string) => {
    const res = await api.get(`/driver/${id}`);
    return res.data;
  },

  updateDriver: async (
    data: DriverUpdateData & { id: string }
  )=> {
    const { id, ...rest } = data;
    const res = await api.put(`/driver/${id}`, rest);
    return res.data;
  },

  deleteDrivers: async (ids: string[]) => {
    await api.delete("/driver/bulk-delete", {
      data: { ids },
    });
  },

  updateDriverStatus: async (data: UpdateDriverStatusData & { id: string }) => {
    const { id, ...rest } = data;
    const res = await api.patch(`/drivers/${id}/status`, { ...rest });
    return res.data;
  },
};

export default driverApi;