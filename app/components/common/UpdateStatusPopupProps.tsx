"use client";

import React, { useState } from "react";
import { MdClose } from "react-icons/md";
import { toast } from "react-hot-toast";
import { ACCOUNT_STATUS } from "@/app/enum";

interface UpdateStatusPopupProps {
  show: boolean;
  reasonValue: string;
  currentStatus: string;
  onClose: () => void;
  onSubmit: (account_status: string, reason: string) => void;
}

const UpdateStatusPopup: React.FC<UpdateStatusPopupProps> = ({
  show,
  reasonValue,
  currentStatus,
  onClose,
  onSubmit,
}) => {
  const [account_status, setAccountStatus] = useState(currentStatus || ACCOUNT_STATUS.PENDING);
  const [reason, setReason] = useState(reasonValue || "");

  const handleSubmit = () => {
    if (!reason.trim()) {
      toast.error("Please provide a reason");
      return;
    }
    onSubmit(account_status, reason);
    setReason("");
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl w-full max-w-md">
        {/* Header */}
        <div className="p-5 border-b border-border-light dark:border-border-dark flex justify-between items-center">
          <h2 className="text-lg font-semibold text-text-main-light dark:text-text-main-dark">
            Update Account Status
          </h2>
          <MdClose
            className="cursor-pointer text-text-muted-light dark:text-text-muted-dark hover:text-text-main-light dark:hover:text-text-main-dark"
            size={24}
            onClick={onClose}
          />
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-text-main-light dark:text-text-main-dark mb-1" htmlFor="status">
              Account Status
            </label>
            <select
              id="status"
              value={account_status}
              onChange={(e) => setAccountStatus(e.target.value)}
              className="w-full border border-border-light dark:border-border-dark rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-slate-800 text-text-main-light dark:text-text-main-dark"
            >
              {Object.values(ACCOUNT_STATUS).map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-text-main-light dark:text-text-main-dark mb-1" htmlFor="reason">
              Reason
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Why are you changing the account status?"
              className="w-full border border-border-light dark:border-border-dark rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-slate-800 text-text-main-light dark:text-text-main-dark placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-border-light dark:border-border-dark flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-background-light dark:bg-[#1f2937] text-text-main-light dark:text-text-main-dark rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors cursor-pointer"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateStatusPopup;
