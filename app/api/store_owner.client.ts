import { api } from "@/app/lib/axios";
import {
  StoreOwnerUpdateData,
  UpdateStoreOwnerStatusData,
} from "@/app/types/storeOwner";

// Store Owner API endpoints
const storeOwnerApi = {
  getStoreOwners: async ({
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
    const res = await api.get("/storeowner", {
      params: { page, limit, status, search },
    });
    return res.data;
  },

  getStoreOwnerById: async (id: string) => {
    const res = await api.get(`/storeowner/${id}`);
    return res.data;
  },

  updateStoreOwner: async (data: StoreOwnerUpdateData & { id: string }) => {
    const { id, ...rest } = data;
    const res = await api.put(`/storeowner/${id}`, rest);
    return res.data;
  },

  deleteStoreOwners: async (ids: string[]) => {
    await api.delete("/storeowner/bulk-delete", {
      data: { ids },
    });
  },

  updateStoreOwnerStatus: async (
    data: UpdateStoreOwnerStatusData & { id: string }
  ) => {
    const { id, ...rest } = data;
    const res = await api.patch(`/storeowner/${id}/status`, { ...rest });
    return res.data;
  },
};

export default storeOwnerApi;
