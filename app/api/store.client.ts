
import { api } from "@/app/lib/axios";
import { StoreUpdateData, UpdateStoreStatusData } from "@/app/types/store";

// Store API endpoints
const storeApi = {
  getStores: async ({
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
    const res = await api.get("/store", {
      params: { page, limit, status, search },
    });
    return res.data;
  },

  getStoreById: async (id: string) => {
    const res = await api.get(`/store/${id}`);
    return res.data;
  },

  updateStore: async (
    data: StoreUpdateData & { id: string }
  ) => {
    const { id, ...rest } = data;
    const res = await api.put(`/store/${id}`, rest);
    return res.data;
  },

  deleteStores: async (ids: string[]) => {
    await api.delete("/store/bulk-delete", {
      data: { ids },
    });
  },

  updateStoreStatus: async (data: UpdateStoreStatusData & { id: string }) => {
    const { id, ...rest } = data;
    const res = await api.patch(`/store/${id}/status`, { ...rest });
    return res.data;
  },
};       

export default storeApi;    