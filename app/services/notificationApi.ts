import { api } from "./api";
import {
  AudienceSummary,
  NotificationLogItem,
  RecipientOption,
  SendPushPayload,
} from "../types/notification";

export const notificationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAudienceSummary: builder.query<{ success: boolean; data: AudienceSummary }, void>({
      query: () => "/notifications/audience-summary",
      providesTags: [{ type: "NotificationLog" as const, id: "SUMMARY" }],
    }),

    getNotificationHistory: builder.query<
      {
        success: boolean;
        data: {
          logs: NotificationLogItem[];
          pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
          };
        };
      },
      { page?: number; limit?: number; search?: string }
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.set("page", String(params.page));
        if (params.limit) queryParams.set("limit", String(params.limit));
        if (params.search) queryParams.set("search", params.search);
        return `/notifications/history?${queryParams.toString()}`;
      },
      providesTags: (result) =>
        result?.data?.logs
          ? [
              ...result.data.logs.map(({ _id }) => ({ type: "NotificationLog" as const, id: _id })),
              { type: "NotificationLog" as const, id: "LIST" },
            ]
          : [{ type: "NotificationLog" as const, id: "LIST" }],
    }),

    searchRecipients: builder.query<
      { success: boolean; data: RecipientOption[] },
      { query?: string; type?: "USER" | "DRIVER" }
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.query) queryParams.set("query", params.query);
        if (params.type) queryParams.set("type", params.type);
        return `/notifications/recipients/search?${queryParams.toString()}`;
      },
    }),

    sendPushNotification: builder.mutation<
      {
        success: boolean;
        message: string;
        data: {
          logId: string;
          recipientCount: number;
          targetAudience: string;
          status: string;
        };
      },
      SendPushPayload
    >({
      query: (body) => ({
        url: "/notifications/send",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "NotificationLog", id: "LIST" },
        { type: "NotificationLog", id: "SUMMARY" },
      ],
    }),
  }),
});

export const {
  useGetAudienceSummaryQuery,
  useGetNotificationHistoryQuery,
  useLazySearchRecipientsQuery,
  useSendPushNotificationMutation,
} = notificationApi;
