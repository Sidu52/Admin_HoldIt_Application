import { api } from "./api";
import { PricingRule, PriceEstimateInput } from "../types/priceRule";

export const priceRuleApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPriceRules: builder.query<
      {
        success: boolean;
        data: {
          rules: PricingRule[];
          pagination: {
            currentPage: number;
            limit: number;
            totalItems: number;
            totalPages: number;
          };
        };
      },
      {
        page?: number;
        limit?: number;
        serviceAreaId?: string;
        active?: boolean;
        sort_by?: string;
        sort_order?: string;
      } | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.set("page", String(params.page));
        if (params?.limit) queryParams.set("limit", String(params.limit));
        if (params?.serviceAreaId) queryParams.set("serviceAreaId", params.serviceAreaId);
        if (params?.active !== undefined) queryParams.set("active", String(params.active));
        if (params?.sort_by) queryParams.set("sort_by", params.sort_by);
        if (params?.sort_order) queryParams.set("sort_order", params.sort_order);
        return `/price-rule?${queryParams.toString()}`;
      },
      providesTags: (result) =>
        result?.data?.rules
          ? [
              ...result.data.rules.map(({ _id }) => ({ type: "PriceRule" as const, id: _id })),
              { type: "PriceRule" as const, id: "LIST" },
            ]
          : [{ type: "PriceRule" as const, id: "LIST" }],
    }),
    getActivePriceRuleByServiceArea: builder.query<{ success: boolean; data: PricingRule }, string>({
      query: (serviceAreaId) => `/price-rule/service-area/${serviceAreaId}`,
      providesTags: (result, error, serviceAreaId) => [{ type: "PriceRule", id: `AREA_${serviceAreaId}` }],
    }),
    getPriceRuleById: builder.query<{ success: boolean; data: PricingRule }, string>({
      query: (id) => `/price-rule/${id}`,
      providesTags: (result, error, id) => [{ type: "PriceRule", id }],
    }),
    createPriceRule: builder.mutation<any, Partial<PricingRule>>({
      query: (data) => ({
        url: "/price-rule",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "PriceRule", id: "LIST" }],
    }),
    updatePriceRule: builder.mutation<any, { id: string; data: Partial<PricingRule> }>({
      query: ({ id, data }) => ({
        url: `/price-rule/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "PriceRule", id },
        { type: "PriceRule", id: "LIST" },
      ],
    }),
    deactivatePriceRule: builder.mutation<any, { id: string; deactivationReason?: string }>({
      query: ({ id, deactivationReason }) => ({
        url: `/price-rule/${id}/deactivate`,
        method: "PATCH",
        body: { deactivationReason },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "PriceRule", id },
        { type: "PriceRule", id: "LIST" },
      ],
    }),
    estimatePrice: builder.mutation<any, PriceEstimateInput>({
      query: (data) => ({
        url: "/price-rule/estimate",
        method: "POST",
        body: data,
      }),
    }),
    clonePriceRule: builder.mutation<any, { id: string; targetServiceAreaId?: string; name?: string }>({
      query: ({ id, targetServiceAreaId, name }) => ({
        url: `/price-rule/${id}/clone`,
        method: "POST",
        body: { targetServiceAreaId, name },
      }),
      invalidatesTags: [{ type: "PriceRule", id: "LIST" }],
    }),
  }),
});

export const {
  useGetPriceRulesQuery,
  useGetActivePriceRuleByServiceAreaQuery,
  useGetPriceRuleByIdQuery,
  useCreatePriceRuleMutation,
  useUpdatePriceRuleMutation,
  useDeactivatePriceRuleMutation,
  useEstimatePriceMutation,
  useClonePriceRuleMutation,
} = priceRuleApi;
