"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { FaArrowLeft, FaPaperPlane, FaUser, FaTruck, FaStore, FaUserTie, FaBoxOpen, FaCheckCircle } from "react-icons/fa";
import { useGetTicketByIdQuery, useReplyTicketMutation, useUpdateTicketStatusMutation } from "../../../../services/supportApi";
import { useToast } from "../../../../hooks/useToast";
import { SupportTicket, TicketMessage, RequesterModel, TicketStatus } from "@/app/types/support";
import { socket } from "@/app/lib/socket";
import Link from "next/link";
import { ChatSkeleton } from "../../../../components/common/Skeleton";

const REQUESTER_CONFIG: Record<RequesterModel, { label: string; icon: React.ReactNode; bg: string; text: string }> = {
  User: { label: "User (Customer)", icon: <FaUser className="text-xs" />, bg: "bg-blue-50 dark:bg-blue-500/10", text: "text-blue-600 dark:text-blue-400" },
  Driver: { label: "Driver", icon: <FaTruck className="text-xs" />, bg: "bg-amber-50 dark:bg-amber-500/10", text: "text-amber-600 dark:text-amber-400" },
  Store: { label: "Store", icon: <FaStore className="text-xs" />, bg: "bg-purple-50 dark:bg-purple-500/10", text: "text-purple-600 dark:text-purple-400" },
  StoreOwner: { label: "Store Owner", icon: <FaUserTie className="text-xs" />, bg: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400" },
};

const STATUS_CONFIG: Record<TicketStatus, { label: string; bg: string; text: string }> = {
  open: { label: "Open", bg: "bg-blue-50 dark:bg-blue-500/10", text: "text-blue-600 dark:text-blue-400" },
  in_progress: { label: "In Progress", bg: "bg-amber-50 dark:bg-amber-500/10", text: "text-amber-600 dark:text-amber-400" },
  pending: { label: "Pending", bg: "bg-purple-50 dark:bg-purple-500/10", text: "text-purple-600 dark:text-purple-400" },
  resolved: { label: "Resolved", bg: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400" },
  closed: { label: "Closed", bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-600 dark:text-slate-400" },
};

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
};

const getSenderName = (msg: TicketMessage, requesterName: string): string => {
  if (msg.senderModel === "Admin") return "Admin Support";
  if (typeof msg.senderId === "object" && msg.senderId) {
    if (msg.senderId.first_name || msg.senderId.last_name) {
      return `${msg.senderId.first_name || ""} ${msg.senderId.last_name || ""}`.trim();
    }
    if (msg.senderId.name) return msg.senderId.name;
  }
  return requesterName;
};

export default function TicketDetailsClient({ ticketId }: { ticketId: string }) {
  const router = useRouter();
  const toast = useToast();
  const [replyText, setReplyText] = useState("");
  const [resolutionNote, setResolutionNote] = useState("");
  const [liveMessages, setLiveMessages] = useState<TicketMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError, refetch } = useGetTicketByIdQuery(ticketId);
  const [replyTicket, { isLoading: isReplying }] = useReplyTicketMutation();
  const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateTicketStatusMutation();

  // Sync initial query messages to local state
  useEffect(() => {
    if (data?.data?.messages) {
      setLiveMessages(data.data.messages);
    }
  }, [data?.data?.messages]);

  // Real-time socket listeners for live messages
  useEffect(() => {
    if (!ticketId) return;

    // Join the support ticket room
    socket.emit("support:join_room", { ticketId });

    const handleNewMessage = (payload: { ticketId: string; message: TicketMessage; status?: string }) => {
      if (String(payload.ticketId) === String(ticketId) && payload.message) {
        setLiveMessages((prev) => {
          const exists = prev.some((m) => m._id && m._id === payload.message._id);
          if (exists) return prev;
          return [...prev, payload.message];
        });
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    };

    const handleStatusUpdate = (payload: { ticketId: string; status: string }) => {
      if (String(payload.ticketId) === String(ticketId)) {
        refetch();
      }
    };

    socket.on("support:new_message", handleNewMessage);
    socket.on("support:status_updated", handleStatusUpdate);

    return () => {
      socket.emit("support:leave_room", { ticketId });
      socket.off("support:new_message", handleNewMessage);
      socket.off("support:status_updated", handleStatusUpdate);
    };
  }, [ticketId, refetch]);

  if (isLoading) {
    return <ChatSkeleton />;
  }

  if (isError || !data?.data) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-center">
        <div>
          <p className="text-lg font-bold text-slate-900 dark:text-white mb-2">Ticket not found</p>
          <button onClick={() => router.back()} className="text-primary font-medium hover:underline cursor-pointer">Go back</button>
        </div>
      </div>
    );
  }

  const ticket: SupportTicket = data.data;
  const reqConfig = REQUESTER_CONFIG[ticket.requesterModel] || REQUESTER_CONFIG.User;
  const statusCfg = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;

  const requesterObj = typeof ticket.requesterId === "object" ? ticket.requesterId : null;
  const requesterName = requesterObj
    ? `${requesterObj.first_name || ""} ${requesterObj.last_name || ""}`.trim() || requesterObj.name || requesterObj.store_name || requesterObj.email || ticket.requesterModel
    : ticket.requesterModel;

  const bookingCode = typeof ticket.bookingId === "object" ? ticket.bookingId?.bookingCode : null;
  const bookingIdStr = typeof ticket.bookingId === "object" ? ticket.bookingId?._id : ticket.bookingId;

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    try {
      await replyTicket({ id: ticketId, message: replyText.trim() }).unwrap();
      setReplyText("");
      toast.success("Reply sent successfully");
    } catch {
      toast.error("Failed to send reply");
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateStatus({ id: ticketId, status: newStatus, resolutionNote }).unwrap();
      toast.success(`Status updated to ${newStatus}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-background text-foreground">
      {/* ── Header ── */}
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700/50 bg-white dark:bg-[#1a2332] sticky top-0 z-20 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <FaArrowLeft className="text-slate-600 dark:text-slate-300" />
          </button>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                {ticket.ticketCode || "Ticket"}
              </h1>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${reqConfig.bg} ${reqConfig.text}`}>
                {reqConfig.icon} {ticket.requesterModel}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${statusCfg.bg} ${statusCfg.text}`}>
                {statusCfg.label}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Subject: <span className="font-semibold text-slate-700 dark:text-slate-200">{ticket.subject}</span> • Created {formatDate(ticket.createdAt)}
            </p>
          </div>
        </div>

        {/* Quick Status Control */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 font-medium hidden sm:inline">Status:</label>
          <select
            value={ticket.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={isUpdatingStatus}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* ── Main Layout (Content & Chat) ── */}
      <div className="flex-1 px-6 py-6 max-w-5xl w-full mx-auto space-y-6">
        {/* Requester & Booking Details Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Requester Info */}
          <div className="bg-white dark:bg-[#1a2332] p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Requester Information</p>
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${reqConfig.bg} ${reqConfig.text}`}>
                {reqConfig.icon}
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-sm">{requesterName}</p>
                {requesterObj?.email && <p className="text-xs text-slate-500 dark:text-slate-400">{requesterObj.email}</p>}
                {requesterObj?.phone && <p className="text-xs text-slate-500 dark:text-slate-400">{requesterObj.phone}</p>}
              </div>
            </div>
          </div>

          {/* Linked Booking Info */}
          <div className="bg-white dark:bg-[#1a2332] p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Linked Booking</p>
            {bookingIdStr ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaBoxOpen className="text-primary text-base" />
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{bookingCode || bookingIdStr}</p>
                    <p className="text-xs text-slate-500">Related to this support ticket</p>
                  </div>
                </div>
                <Link
                  href={`/bookings/${bookingIdStr}`}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-xs font-bold hover:bg-primary hover:text-white transition-colors"
                >
                  View Booking
                </Link>
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-1">No booking attached to this ticket.</p>
            )}
          </div>
        </div>

        {/* Resolution Note if resolved/closed */}
        {(ticket.status === "resolved" || ticket.status === "closed") && ticket.resolutionNote && (
          <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 p-4 rounded-xl flex items-start gap-3">
            <FaCheckCircle className="text-emerald-600 dark:text-emerald-400 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Resolution Summary</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">{ticket.resolutionNote}</p>
            </div>
          </div>
        )}

        {/* Chat / Messages Thread */}
        <div className="bg-white dark:bg-[#1a2332] rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
          <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/40">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Conversation Messages</h3>
          </div>

          <div className="flex-1 p-5 space-y-4 overflow-y-auto max-h-[500px]">
            {(!liveMessages || liveMessages.length === 0) ? (
              <p className="text-xs text-slate-400 text-center py-8">No messages recorded in this ticket.</p>
            ) : (
              liveMessages.map((msg: TicketMessage, idx: number) => {
                const isAdmin = msg.senderModel === "Admin";
                const senderName = getSenderName(msg, requesterName);

                return (
                  <div
                    key={msg._id || `msg-${idx}`}
                    className={`flex flex-col ${isAdmin ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-xl p-4 rounded-2xl text-xs space-y-1.5 shadow-sm ${
                        isAdmin
                          ? "bg-primary text-white rounded-br-none"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-none"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4 border-b border-white/20 pb-1 mb-1">
                        <span className="font-bold opacity-90">{senderName} ({msg.senderModel})</span>
                        <span className="text-[10px] opacity-75">{formatDate(msg.createdAt)}</span>
                      </div>
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>

                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="pt-2 flex flex-wrap gap-2">
                          {msg.attachments.map((att, idx) => (
                            <a
                              key={idx}
                              href={att.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] underline opacity-90 hover:opacity-100 block"
                            >
                              Attachment {idx + 1}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Reply Box Form */}
          <form onSubmit={handleSendReply} className="p-4 border-t border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/40">
            <div className="flex flex-col gap-3">
              <textarea
                rows={3}
                placeholder="Type your response to this support request..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                disabled={isReplying}
                className="w-full p-3 bg-white dark:bg-[#1a2332] border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground resize-none"
              />
              <div className="flex justify-between items-center">
                <p className="text-[11px] text-slate-400">
                  Replying as <span className="font-semibold text-slate-600 dark:text-slate-300">Admin Support Agent</span>
                </p>
                <button
                  type="submit"
                  disabled={isReplying || !replyText.trim()}
                  className="px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  <FaPaperPlane className="text-xs" /> Send Reply
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
