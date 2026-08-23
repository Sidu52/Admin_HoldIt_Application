import { api } from "./api";
import { SupportSummary, SupportTicket } from "../types/support";

export const supportApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSupportSummary: builder.query<{ success: boolean; data: SupportSummary }, void>({
      query: () => "/support/summary",
      providesTags: ["SupportSummary" as any],
    }),
    getTickets: builder.query<
      {
        success: boolean;
        data: {
          tickets: SupportTicket[];
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
        status?: string;
        priority?: string;
        category?: string;
        role?: string;
        chatType?: string;
        assignedTo?: string;
        search?: string;
      }
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.set("page", String(params.page));
        if (params.limit) queryParams.set("limit", String(params.limit));
        if (params.status) queryParams.set("status", params.status);
        if (params.priority) queryParams.set("priority", params.priority);
        if (params.category) queryParams.set("category", params.category);
        if (params.role) queryParams.set("role", params.role);
        if (params.chatType) queryParams.set("chatType", params.chatType);
        if (params.assignedTo) queryParams.set("assignedTo", params.assignedTo);
        if (params.search) queryParams.set("search", params.search);
        return `/support?${queryParams.toString()}`;
      },
      providesTags: (result) =>
        result?.data?.tickets
          ? [
              ...result.data.tickets.map(({ _id }) => ({ type: "SupportTicket" as const, id: _id })),
              { type: "SupportTicket" as const, id: "LIST" },
            ]
          : [{ type: "SupportTicket" as const, id: "LIST" }],
    }),
    getTicketById: builder.query<{ success: boolean; data: SupportTicket }, string>({
      query: (id) => `/support/${id}`,
      providesTags: (result, error, id) => [{ type: "SupportTicket", id }],
    }),
    replyTicket: builder.mutation<any, { id: string; message: string; attachments?: any[] }>({
      query: ({ id, message, attachments }) => ({
        url: `/support/${id}/reply`,
        method: "POST",
        body: { message, attachments },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "SupportTicket", id },
        { type: "SupportTicket", id: "LIST" },
        "SupportSummary" as any,
      ],
    }),
    updateTicketStatus: builder.mutation<any, { id: string; status: string; resolutionNote?: string }>({
      query: ({ id, status, resolutionNote }) => ({
        url: `/support/${id}/status`,
        method: "PATCH",
        body: { status, resolutionNote },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "SupportTicket", id },
        { type: "SupportTicket", id: "LIST" },
        "SupportSummary" as any,
      ],
    }),
    assignTicket: builder.mutation<any, { id: string; assignedTo?: string }>({
      query: ({ id, assignedTo }) => ({
        url: `/support/${id}/assign`,
        method: "PATCH",
        body: { assignedTo },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "SupportTicket", id },
        { type: "SupportTicket", id: "LIST" },
        "SupportSummary" as any,
      ],
    }),
  }),
});

export const {
  useGetSupportSummaryQuery,
  useGetTicketsQuery,
  useGetTicketByIdQuery,
  useReplyTicketMutation,
  useUpdateTicketStatusMutation,
  useAssignTicketMutation,
} = supportApi;
