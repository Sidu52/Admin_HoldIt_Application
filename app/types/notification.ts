export interface AudienceSummary {
  users: {
    total: number;
    withToken: number;
    activeWithToken: number;
  };
  drivers: {
    total: number;
    withToken: number;
    onlineWithToken: number;
  };
  totalReachableDevices: number;
}

export type TargetAudience =
  | "ALL_USERS"
  | "ALL_ACTIVE_USERS"
  | "ALL_DRIVERS"
  | "ALL_ONLINE_DRIVERS"
  | "SPECIFIC_USER"
  | "SPECIFIC_DRIVER"
  | "BROADCAST_ALL";

export interface SendPushPayload {
  title: string;
  body: string;
  targetAudience: TargetAudience;
  targetRecipientId?: string | null;
  screen?: string;
  customData?: Record<string, any>;
  priority?: "default" | "normal" | "high";
  sound?: "default" | "none";
}

export interface NotificationLogItem {
  _id: string;
  title: string;
  body: string;
  targetAudience: TargetAudience;
  targetRecipientId?: string | null;
  targetRecipientName?: string | null;
  screen: string;
  customData?: Record<string, any>;
  recipientCount: number;
  successCount: number;
  failureCount: number;
  sentBy: string;
  sentByName: string;
  sentByRole: string;
  status: "COMPLETED" | "FAILED" | "PARTIAL";
  createdAt: string;
  updatedAt: string;
}

export interface RecipientOption {
  _id: string;
  name: string;
  phone?: string;
  email?: string;
  hasPushToken: boolean;
  isOnline?: boolean;
  accountStatus?: string;
  type: "USER" | "DRIVER";
}
