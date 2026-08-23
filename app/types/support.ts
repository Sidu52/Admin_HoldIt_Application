export type TicketStatus = "open" | "in_progress" | "pending" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type RequesterModel = "User" | "Driver" | "Store" | "StoreOwner";

export interface TicketMessage {
  _id: string;
  senderId: string | { _id: string; first_name?: string; last_name?: string; email?: string; name?: string };
  senderModel: "User" | "Driver" | "Store" | "StoreOwner" | "Admin";
  message: string;
  attachments?: { url: string; fileName?: string; fileType?: string }[];
  createdAt: string;
}

export interface PopulatedRequester {
  _id: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  email?: string;
  phone?: string;
  store_name?: string;
}

export interface SupportTicket {
  _id: string;
  ticketCode: string;
  requesterId: PopulatedRequester | string;
  requesterModel: RequesterModel;
  bookingId?: { _id: string; bookingCode?: string; status?: string } | string;
  chatType?: "ticket" | "live_chat";
  isEscalatedToLive?: boolean;
  subject: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo?: { _id: string; first_name?: string; last_name?: string; email?: string; name?: string } | string;
  resolutionNote?: string;
  resolvedAt?: string;
  closedAt?: string;
  lastMessageAt?: string;
  messages?: TicketMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface SupportSummary {
  openCount: number;
  inProgressCount: number;
  pendingCount: number;
  awaitingAdminCount: number;
  resolvedCount: number;
  closedCount: number;
  liveChatCount: number;
  unassignedCount: number;
  byRole: {
    User: number;
    Driver: number;
    Store: number;
    StoreOwner: number;
  };
}
