import React from "react";
import { Driver } from "@/app/types/driver";
import { formatDateTime } from "@/app/utils/helper";

interface DriverDetailHeaderProps {
  driver: Driver;
  onEdit: () => void;
  onSuspend: () => void;
  isLoading: boolean;
}

const DriverDetailHeader: React.FC<DriverDetailHeaderProps> = ({
  driver,
  onEdit,
  onSuspend,
  isLoading,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return (
          <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400 border border-emerald-500/20">
            <span className="size-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
            Active
          </span>
        );
      case "inactive":
        return (
          <span className="inline-flex items-center rounded-full bg-slate-700/30 px-2.5 py-0.5 text-xs font-medium text-slate-400 border border-slate-600/30">
            <span className="size-1.5 rounded-full bg-slate-400 mr-1.5" />
            Inactive
          </span>
        );
      case "suspended":
        return (
          <span className="inline-flex items-center rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-400 border border-red-500/20">
            <span className="size-1.5 rounded-full bg-red-400 mr-1.5" />
            Suspended
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-400 border border-blue-500/20">
            <span className="size-1.5 rounded-full bg-blue-400 mr-1.5" />
            {status}
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6 rounded-xl bg-card-dark p-6 border border-border-dark shadow-lg md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col gap-6 md:flex-row md:items-center">
        <div className="relative">
          <div className="size-24 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 bg-cover bg-center border-4 border-[#232f48] shadow-md overflow-hidden">
            {/* Driver initials as fallback */}
            <div className="flex items-center justify-center h-full text-white text-2xl font-bold">
              {driver.first_name?.[0]}{driver.last_name?.[0]}
            </div>
          </div>
          {driver.is_online && (
            <div className="absolute bottom-1 right-1 size-3 rounded-full bg-emerald-500 border-2 border-[#232f48] animate-pulse" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-white">
              {driver.first_name} {driver.last_name}
            </h1>
            {getStatusBadge(driver.status)}
          </div>
          <div className="flex flex-col gap-1 text-sm text-text-secondary sm:flex-row sm:gap-4">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">badge</span>
              ID: #{driver._id.slice(-6).toUpperCase()}
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">calendar_month</span>
              Joined: {formatDateTime(driver.createdAt, "datetime")}
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">
                {driver.is_online ? "wifi" : "wifi_off"}
              </span>
              {driver.is_online ? "Online" : "Offline"}
            </span>
          </div>
        </div>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onSuspend}
          disabled={isLoading || driver.status === "suspended"}
          className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-bold transition ${
            driver.status === "suspended"
              ? "border-red-500/30 bg-red-500/10 text-red-400 cursor-not-allowed"
              : "border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <span className="material-symbols-outlined text-[20px]">block</span>
          <span>{driver.status === "suspended" ? "Suspended" : "Suspend"}</span>
        </button>
        <button
          onClick={onEdit}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-white transition hover:bg-blue-600 shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-[20px]">edit</span>
          <span>Edit Profile</span>
        </button>
      </div>
    </div>
  );
};

export default DriverDetailHeader;