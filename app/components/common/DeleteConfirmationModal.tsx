"use client";

import React from "react";
import { MdDelete, MdWarning } from "react-icons/md";

interface DeleteConfirmationModalProps {
  modalTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  count: number;
  isLoading: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  modalTitle,
  isOpen,
  onClose,
  onConfirm,
  count,
  isLoading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-surface-dark border border-surface-border rounded-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="size-12 rounded-full bg-red-500/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-red-500 text-[24px]">
                  <MdWarning />
                </span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-2">
                Delete {count} {count === 1 ? modalTitle : `${modalTitle}s`}
              </h3>
              <p className="text-slate-400 text-sm">
                Are you sure you want to delete{" "}
                {count === 1 ? "this driver" : `these ${count} ${modalTitle}s`}?
                This action cannot be undone. All associated data will be
                permanently removed.
              </p>
            </div>
          </div>

          <div className="mt-6 bg-slate-800/30 border border-slate-700/50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-amber-500 text-[20px]">
                <MdWarning />
              </span>
              <p className="text-sm text-slate-300">
                <span className="font-semibold text-white">Note:</span> Deleting
                drivers will:
              </p>
            </div>
            <ul className="mt-2 text-sm text-slate-400 space-y-1 ml-8">
              <li>• Remove {modalTitle} from the system permanently</li>
              <li>• Delete all associated documents and records</li>
            </ul>
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
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">
                    <MdDelete />
                  </span>
                  Delete {count === 1 ? modalTitle : `${modalTitle}s`}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
