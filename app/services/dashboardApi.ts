import { api } from "./api";

export const dashboardApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSummary: builder.query<any, void>({
      query: () => "/dashboard/summary",
      providesTags: ["Dashboard"],
    }),
    getChart: builder.query<any, { entity?: string; range?: string; status?: string }>({
      query: (params) => ({
        url: "/dashboard/chart",
        params,
      }),
      providesTags: ["Dashboard"],
    }),
  }),
});

export const { useGetSummaryQuery, useGetChartQuery } = dashboardApi;
