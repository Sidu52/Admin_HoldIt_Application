// app/components/driver/StatusUpdateModal.tsx
"use client";

import React, { useState } from "react";
import { MdCheckCircle, MdInfo } from "react-icons/md";

interface StatusUpdateModalProps {
  isOpen: boolean;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({
  isOpen,
  selectedStatus,
  setSelectedStatus,
  onClose,
  onConfirm,
  isLoading,
}) => {
  const statusOptions = [
    {
      value: "active",
      label: "Active",
      description: "Driver can accept and complete deliveries",
      color: "emerald",
    },
    {
      value: "inactive",
      label: "Inactive",
      description: "Driver cannot accept new deliveries",
      color: "slate",
    },
    {
      value: "pending",
      label: "Pending",
      description: "Driver is pending verification or approval",
      color: "amber",
    },
    {
      value: "blocked",
      label: "Suspended",
      description: "Driver account is temporarily suspended",
      color: "red",
    },
  ];

  const getStatusColor = (color: string) => {
    switch (color) {
      case "emerald":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "amber":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "red":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "blue":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      default:
        return "bg-slate-700/30 text-slate-400 border-slate-600/30";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-surface-dark border border-surface-border rounded-xl w-full max-w-md"
      >
        <div className="p-6">
          <h3 className="text-lg font-bold text-white mb-2">Update Status</h3>
          <p className="text-slate-400 text-sm mb-6">Select the new status</p>

          <div className="grid grid-cols-2 gap-4">
            {statusOptions.map((status) => (
              <label
                key={status.value}
                className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedStatus === status.value
                    ? `${getStatusColor(status.color)} ring-2 ring-[#135bec]/50`
                    : "border-surface-border hover:bg-surface-border/50"
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value={status.value}
                  checked={selectedStatus === status.value}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getStatusColor(
                        status.color
                      )}`}
                    >
                      {status.label}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs">{status.description}</p>
                </div>
              </label>
            ))}
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-[#135bec] hover:bg-[#135bec]-dark text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">
                    <MdCheckCircle />
                  </span>
                  Update Status
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default StatusUpdateModal;
