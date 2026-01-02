// app/components/driver/EditDriverModal.tsx
"use client";

import React from "react";
import { Driver } from "@/app/types/driver";
import EditDriver from "../EditDriver";

interface EditDriverModalProps {
  driver: Driver;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const EditDriverModal: React.FC<EditDriverModalProps> = ({
  driver,
  isOpen,
  onClose,
  onSuccess,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="relative w-full max-w-6xl bg-background-dark rounded-2xl border border-border-dark shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>

          {/* Edit Driver Component */}
          <EditDriver
            driver={driver} 
            onClose={onClose} 
            isModal={true} 
          />
        </div>
      </div>
    </div>
  );
};

export default EditDriverModal;