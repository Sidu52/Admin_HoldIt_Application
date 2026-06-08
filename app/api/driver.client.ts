import { api } from "@/app/lib/axios";
import { Driver, DriversResponse, DriverUpdateData } from "@/app/types/driver";

interface GetDriversParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  vehicleType?: string;
  is_online?: boolean | null;
}

interface UpdateDriverStatusParams {
  id: string;
  status: string;
  account_deactivated_reason?: string;
}

const driverApi = {
  getDrivers: async (params: GetDriversParams): Promise<DriversResponse> => {
    const response = await api.get<{ data: DriversResponse }>("/driver", {
      params,
    });
    return response.data.data;
  },

  getDriverById: async (id: string): Promise<Driver> => {
    const response = await api.get<{ data: Driver }>(`/driver/${id}`);
    return response.data.data;
  },

  updateDriver: async ({
    id,
    data,
  }: {
    id: string;
    data: Partial<DriverUpdateData>;
  }): Promise<Driver> => {
    const response = await api.patch<{ data: Driver }>(`/driver/${id}`, data);
    return response.data.data;
  },

  deleteDrivers: async (ids: string[]): Promise<void> => {
    await api.post("/driver/bulk-delete", {
      ids,
      reason: "Admin bulk deactivation",
    });
  },

  updateDriverStatus: async ({
    id,
    status,
    account_deactivated_reason,
  }: UpdateDriverStatusParams): Promise<Driver> => {
    const response = await api.patch<{ data: Driver }>(`/driver/${id}/status`, {
      account_status: status,
      account_deactivated_reason,
    });
    return response.data.data;
  },
};

export default driverApi;
