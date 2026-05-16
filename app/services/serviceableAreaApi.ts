import { api } from "./api";

export const serviceableAreaApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getServiceableAreas: builder.query<any, any>({
      query: (params) => ({
        url: "/serviceable",
        params,
      }),
      transformResponse: (response: any) => {
        if (response?.data?.areas) {
          response.data.areas = response.data.areas.map((area: any) => ({
            ...area,
            id: area._id,
          }));
        }
        if (response?.data?.pagination) {
          response.data.pagination = {
            totalItems: response.data.pagination.total,
            currentPage: response.data.pagination.page,
            totalPages: response.data.pagination.pages,
          };
        }
        return response;
      },
      providesTags: (result) =>
        result?.data?.areas
          ? [
              ...result.data.areas.map(({ id }: { id: string }) => ({ type: "ServiceableArea" as const, id })),
              { type: "ServiceableArea", id: "LIST" },
            ]
          : [{ type: "ServiceableArea", id: "LIST" }],
    }),
    getServiceableArea: builder.query<any, string>({
      query: (id) => `/serviceable/${id}`,
      transformResponse: (response: any) => {
        if (response?.data) {
          return {
            ...response,
            data: {
              ...response.data,
              id: response.data._id,
            },
          };
        }
        return response;
      },
      providesTags: (result, error, id) => [{ type: "ServiceableArea", id }],
    }),
    createServiceableArea: builder.mutation<any, any>({
      query: (data) => ({
        url: "/serviceable",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "ServiceableArea", id: "LIST" }],
    }),
    updateServiceableArea: builder.mutation<any, { areaId: string; data: any }>({
      query: ({ areaId, data }) => ({
        url: `/serviceable/${areaId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { areaId }) => [
        { type: "ServiceableArea", id: areaId },
        { type: "ServiceableArea", id: "LIST" },
      ],
    }),
    toggleServiceableAreaStatus: builder.mutation<any, { areaId: string; isActive: boolean }>({
      query: ({ areaId, isActive }) => ({
        url: `/serviceable/${areaId}/status`,
        method: "PATCH",
        body: { is_active: isActive },
      }),
      async onQueryStarted({ areaId, isActive }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          serviceableAreaApi.util.updateQueryData("getServiceableArea", areaId, (draft) => {
            if (draft?.data) draft.data.is_active = isActive;
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (result, error, { areaId }) => [
        { type: "ServiceableArea", id: areaId },
        { type: "ServiceableArea", id: "LIST" },
      ],
    }),
    deleteServiceableArea: builder.mutation<any, string>({
      query: (id) => ({
        url: `/serviceable/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "ServiceableArea", id: "LIST" }],
    }),
  }),
});

export const {
  useGetServiceableAreasQuery,
  useGetServiceableAreaQuery,
  useCreateServiceableAreaMutation,
  useUpdateServiceableAreaMutation,
  useToggleServiceableAreaStatusMutation,
  useDeleteServiceableAreaMutation,
} = serviceableAreaApi;
