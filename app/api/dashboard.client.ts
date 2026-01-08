import { api } from "../lib/axios";

// Dashboard API endpoints
const dashboardApi = {
  getSummary: async () => {
    const res = await api.get("/dashboard/summary");
    console.log("RES",res.data)
    return res.data;
  },

  getChart: async ({
    entity,
    range,
  }: {
    entity: string;
    range: string;
  }) => {
    const res = await api.get(
      `/dashboard/chart?entity=${entity}&range=${range}`
    );
    return res.data;
  },
};

export default dashboardApi;