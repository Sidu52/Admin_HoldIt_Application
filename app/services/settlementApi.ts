import { api } from "./api";

export interface SettlementBankSnapshot {
  accountNumber?: string | null;
  ifscCode?: string | null;
  beneficiaryName?: string | null;
  upiId?: string | null;
  mode?: string;
}

export interface PartnerSummaryResponse {
  recipient: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    bankDetails: {
      accountNumber?: string | null;
      ifscCode?: string | null;
      beneficiaryName?: string | null;
      upiId?: string | null;
      preferredMode?: string;
      isVerified?: boolean;
      verifiedAt?: string;
    };
    isBankVerified: boolean;
    accountStatus: string;
  };
  cycleInfo: {
    cycleType: string;
    currentWindowStart: string;
    currentWindowEnd: string;
    isCustomWindow: boolean;
    lastSettledAt: string | null;
    lastSettlementType: string;
  };
  pendingSettlement: {
    earningsCount: number;
    grossAmountMinor: number;
    grossAmount: number;
    commissionDeductedMinor: number;
    commissionDeducted: number;
    netAmountMinor: number;
    netAmount: number;
    minThreshold: number;
    isEligibleForDisbursement: boolean;
    ineligibilityReason: string | null;
    earnings: Array<{
      _id: string;
      bookingId: string;
      bookingCode: string;
      purpose: string;
      grossAmount: number;
      netAmount: number;
      createdAt: string;
    }>;
  };
  recentPayouts: Array<{
    _id: string;
    cycleType: string;
    cycleStart: string;
    cycleEnd: string;
    earningsCount: number;
    grossAmount: number;
    commissionDeducted: number;
    amount: number;
    status: string;
    payoutMode: string;
    providerTransferId?: string;
    createdAt: string;
    bankSnapshot?: SettlementBankSnapshot;
  }>;
}

export const settlementApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPartnerSettlementSummary: builder.query<
      { message: string; data: PartnerSummaryResponse },
      { recipientType: "DRIVER" | "STORE_OWNER"; recipientId: string }
    >({
      query: ({ recipientType, recipientId }) => ({
        url: `/settlement/partner/${recipientType}/${recipientId}/summary`,
      }),
      providesTags: (_result, _error, { recipientType, recipientId }) => [
        { type: "Settlement", id: `${recipientType}-${recipientId}` },
      ],
    }),

    triggerManualSettlement: builder.mutation<
      any,
      { recipientType: "DRIVER" | "STORE_OWNER"; recipientId: string; note?: string }
    >({
      query: (body) => ({
        url: `/settlement/manual-disburse`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { recipientType, recipientId }) => [
        { type: "Settlement", id: `${recipientType}-${recipientId}` },
        { type: recipientType === "DRIVER" ? "Driver" : "StoreOwner", id: recipientId },
        { type: "Settlement", id: "DASHBOARD" },
      ],
    }),

    verifyPartnerBankDetails: builder.mutation<
      any,
      { recipientType: "DRIVER" | "STORE_OWNER"; recipientId: string }
    >({
      query: ({ recipientType, recipientId }) => ({
        url: `/settlement/verify-bank/${recipientType}/${recipientId}`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, { recipientType, recipientId }) => [
        { type: "Settlement", id: `${recipientType}-${recipientId}` },
        { type: recipientType === "DRIVER" ? "Driver" : "StoreOwner", id: recipientId },
      ],
    }),

    getSettlementDashboard: builder.query<any, any>({
      query: (params) => ({
        url: `/settlement/dashboard`,
        params,
      }),
      providesTags: [{ type: "Settlement", id: "DASHBOARD" }],
    }),
  }),
});

export const {
  useGetPartnerSettlementSummaryQuery,
  useTriggerManualSettlementMutation,
  useVerifyPartnerBankDetailsMutation,
  useGetSettlementDashboardQuery,
} = settlementApi;
