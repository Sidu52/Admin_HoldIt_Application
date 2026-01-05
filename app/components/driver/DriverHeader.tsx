// app/components/driver/DriverHeader.tsx
import React from "react";
import { MdAdd, MdCheckCircle, MdDelete, MdPauseCircle } from "react-icons/md";

interface DriverHeaderProps {
  selectedCount: number;
  onAddDriver: () => void;
  onDeleteSelected: () => void;
  onUpdateStatus: (status: string) => void;
  onClearSelected: () => void;
  isLoading: boolean;
}

const DriverHeader: React.FC<DriverHeaderProps> = ({
  selectedCount,
  onAddDriver,
  onDeleteSelected,
  onUpdateStatus,
  onClearSelected,
  isLoading,
}) => {
  return (
    <header className="flex flex-col gap-6 px-6 pt-8 pb-4 shrink-0">
      <div className="flex flex-wrap justify-between items-end gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-white text-3xl font-bold tracking-tight">
            Driver Management
          </h2>
          <p className="text-slate-400 text-base">
            Manage fleet drivers, view status, and update details.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {selectedCount > 0 && (
            <>
              <span className="text-slate-400 text-sm">
                {selectedCount} selected
              </span>
              <button
                onClick={() => onUpdateStatus("active")}
                className="flex items-center justify-center gap-2 h-9 px-4 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 text-sm font-medium rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">
                  <MdCheckCircle />
                </span>
                Mark Active
              </button>
              <button
                onClick={() => onUpdateStatus("inactive")}
                className="flex items-center justify-center gap-2 h-9 px-4 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-300 text-sm font-medium rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">
                  <MdPauseCircle />
                </span>
                Mark Inactive
              </button>
              <button
                onClick={onDeleteSelected}
                className="flex items-center justify-center gap-2 h-9 px-4 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 text-sm font-medium rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">
                  <MdDelete />
                </span>
                Delete
              </button>
            </>
          )}
          
          <button
            onClick={onAddDriver}
            className="flex items-center justify-center gap-2 h-10 px-5 bg-[#135bec] hover:bg-[#135bec]-dark transition-colors text-white text-sm font-bold rounded-lg shadow-lg shadow-[#135bec]/20"
          >
            <span className="material-symbols-outlined text-[20px]"><MdAdd /></span>
            <span>Add New Driver</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default DriverHeader;