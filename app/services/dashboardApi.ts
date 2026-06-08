import { api } from "./api";

export const dashboardApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSummary: builder.query<any, void>({
      query: () => "/dashboard/summary",
      providesTags: ["Dashboard"],
    }),
    getChart: builder.query<any, { type?: string; from?: string; to?: string; groupBy?: string }>({
      query: (params) => ({
        url: "/dashboard/chart",
        params,
      }),
      providesTags: ["Dashboard"],
    }),
  }),
});

export const { useGetSummaryQuery, useGetChartQuery } = dashboardApi;
