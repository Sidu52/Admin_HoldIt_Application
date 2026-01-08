import { api } from "../lib/axios";
import { Driver, DriverUpdateData } from "../types/driver";

// Driver API endpoints
const driverApi = {
  getDrivers: async (
    page = 1,
    limit = 10,
    status = "",
    search = ""
  ): Promise<{
    drivers: Driver[];
    total: number;
    page: number;
    limit: number;
  }> => {
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
    const res = await api.put("/driver/update", data);
    return res.data;
  },

  deleteDrivers: async (ids: string[]): Promise<void> => {
    await api.delete("/drivers/bulk-delete", {
      data: { ids },
    });
  },

  updateDriverStatus: async (
    id: string,
    status: string
  )=> {
    const res = await api.patch(`/drivers/${id}/status`, { status });
    return res.data;
  },
};

export default driverApi;