"use client";

import React, { useState } from "react";
import { MdClose } from "react-icons/md";
import { toast } from "react-hot-toast";

interface UpdateStatusPopupProps {
  is_active: boolean;
  show: boolean;
  currentStatus: string;
  onClose: () => void;
  onSubmit: (status: string, reason: string, is_active: boolean) => void;
}

const ACCOUNT_STATUS = {
  ACTIVE: "active",
  PENDING: "pending",
  BLOCKED: "blocked",
  INACTIVE: "inactive",
};

const UpdateStatusPopup: React.FC<UpdateStatusPopupProps> = ({
  is_active,
  show,
  currentStatus,
  onClose,
  onSubmit,
}) => {
  const [status, setStatus] = useState(currentStatus || ACCOUNT_STATUS.PENDING);
  const [reason, setReason] = useState("");
  const [isActive, setIsActive] = useState(is_active);

  const handleSubmit = () => {
    if (!reason.trim()) {
      toast.error("Please provide a reason");
      return;
    }
    onSubmit(status, reason, isActive);
    setReason("");
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#fff] border border-surface-border rounded-xl w-full max-w-md">
        {/* Header */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Update Account Status
          </h2>
          <MdClose
            className="cursor-pointer text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            size={24}
            onClick={onClose}
          />
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Status */}
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="status">
              Account Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
            >
              {Object.values(ACCOUNT_STATUS).map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
          {/* Description/Reason */}
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="reason">
              Reason / Description
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Why are you changing the account status?"
              className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Active and Inactive  Toggle  */}
          <div className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-600">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Account Status
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Toggle to activate or deactivate this account
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsActive((prev) => !prev)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300
      ${isActive ? "bg-green-600" : "bg-gray-400"}
    `}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300
        ${isActive ? "translate-x-6" : "translate-x-1"}
      `}
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateStatusPopup;
