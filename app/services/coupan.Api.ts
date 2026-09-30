import { api } from "./api";

export const coupanApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ── List all coupons (with filters/pagination) ──
    getCoupans: builder.query<any, any>({
      query: (params) => ({
        url: "/coupan",
        params,
      }),
      providesTags: (result) => {
        if (result && result.data && result.data.coupons) {
          return [
            ...result.data.coupons.map(({ _id }: { _id: string }) => ({ type: "Coupon" as const, id: _id })),
            { type: "Coupon" as const, id: "PARTIAL-LIST" },
          ];
        } else {
          return [{ type: "Coupon" as const, id: "PARTIAL-LIST" }];
        }
      },
    }),

    // ── Get single coupon by ID ──
    getCoupan: builder.query<any, string>({
      query: (id) => `/coupan/${id}`,
      providesTags: (result, error, id) => [{ type: "Coupon" as const, id }],
    }),

    // ── Create coupon ──
    createCoupan: builder.mutation<any, any>({
      query: (body) => ({
        url: "/coupan",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Coupon", id: "PARTIAL-LIST" }],
    }),

    // ── Update coupon ──
    updateCoupan: builder.mutation<any, any>({
      query: ({ id, ...body }) => ({
        url: `/coupan/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Coupon", id },
        { type: "Coupon", id: "PARTIAL-LIST" },
      ],
    }),

    // ── Delete coupon ──
    deleteCoupan: builder.mutation<any, string>({
      query: (id) => ({
        url: `/coupan/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Coupon", id },
        { type: "Coupon", id: "PARTIAL-LIST" },
      ],
    }),

    // ── Assign coupon to users ──
    assignCoupon: builder.mutation<any, { couponId: string; userIds: string[] }>({
      query: (body) => ({
        url: "/coupan/assign",
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { couponId }) => [
        { type: "Coupon", id: couponId },
        { type: "Coupon", id: "PARTIAL-LIST" },
      ],
    }),

    // ── Unassign (revoke) coupon from users ──
    unassignCoupon: builder.mutation<any, { couponId: string; userIds: string[] }>({
      query: (body) => ({
        url: "/coupan/unassign",
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { couponId }) => [
        { type: "Coupon", id: couponId },
        { type: "Coupon", id: "PARTIAL-LIST" },
      ],
    }),

    // ── Get assigned users for a coupon ──
    getAssignedUsers: builder.query<any, { couponId: string; page?: number; limit?: number; status?: string; search?: string }>({
      query: ({ couponId, ...params }) => ({
        url: `/coupan/${couponId}/assigned-users`,
        params,
      }),
      providesTags: (result, error, { couponId }) => [{ type: "Coupon" as const, id: couponId }],
    }),

    // ── Preview / validate coupon ──
    applyCoupon: builder.mutation<any, { code: string; orderAmount: number; userId?: string; orderId?: string }>({
      query: (body) => ({
        url: "/coupan/apply",
        method: "POST",
        body,
      }),
    }),

    // ── Get coupon stats ──
    getCouponStats: builder.query<any, any>({
      query: (params) => ({
        url: "/coupan/stats",
        params,
      }),
      providesTags: [{ type: "Coupon" as const, id: "STATS" }],
    }),

    // ── Get user coupon history ──
    getCouponUser: builder.query<any, string>({
      query: (userId) => `/coupan/user/${userId}/coupan`,
      providesTags: (result, error, userId) => [{ type: "Coupon" as const, id: `user-${userId}` }],
    }),

    // ── Get user available coupons ──
    getUserCoupons: builder.query<any, string>({
      query: (userId) => `/coupan/user/${userId}`,
      providesTags: (result, error, userId) => [{ type: "Coupon" as const, id: `user-available-${userId}` }],
    }),

    // ── Get redemption logs ──
    getCouponRedemptions: builder.query<any, any>({
      query: (params) => ({
        url: "/coupan/redemption",
        params,
      }),
      providesTags: [{ type: "Coupon" as const, id: "REDEMPTIONS" }],
    }),

    // ── Apply coupon to booking (persist) ──
    applyBookingCoupon: builder.mutation<any, { bookingId: string; couponCode?: string; code?: string; couponId?: string }>({
      query: ({ bookingId, code, ...body }) => ({
        url: `/booking/${bookingId}/apply-coupon`,
        method: "POST",
        body: {
          ...body,
          couponCode: body.couponCode || code,
        },
      }),
      invalidatesTags: (result, error, { bookingId }) => [
        { type: "Booking", id: bookingId },
        "Booking",
        { type: "Coupon", id: "PARTIAL-LIST" },
      ],
    }),

    // ── Remove coupon from booking ──
    removeBookingCoupon: builder.mutation<any, string>({
      query: (bookingId) => ({
        url: `/booking/${bookingId}/remove-coupon`,
        method: "POST",
      }),
      invalidatesTags: (result, error, bookingId) => [
        { type: "Booking", id: bookingId },
        "Booking",
        { type: "Coupon", id: "PARTIAL-LIST" },
      ],
    }),
  }),
});

export const {
  useGetCoupanQuery,
  useGetCoupansQuery,
  useCreateCoupanMutation,
  useUpdateCoupanMutation,
  useDeleteCoupanMutation,
  useAssignCouponMutation,
  useUnassignCouponMutation,
  useGetAssignedUsersQuery,
  useApplyCouponMutation,
  useGetCouponStatsQuery,
  useGetCouponUserQuery,
  useGetUserCouponsQuery,
  useGetCouponRedemptionsQuery,
  useApplyBookingCouponMutation,
  useRemoveBookingCouponMutation,
} = coupanApi;