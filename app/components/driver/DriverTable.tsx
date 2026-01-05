// app/components/driver/DriverTable.tsx
import { Driver } from "@/app/types/driver";
import React from "react";
import { MdMail, MdPhone } from "react-icons/md";

interface DriverTableProps {
  drivers: Driver[];
  isLoading: boolean;
  selectedDrivers: string[];
  onSelectDriver: (id: string) => void;
  onSelectAll: () => void;
  onEditDriver: (driver: Driver) => void;
  onViewDetails: (driver: Driver) => void;
}

const DriverTable: React.FC<DriverTableProps> = ({
  drivers,
  isLoading,
  selectedDrivers,
  onSelectDriver,
  onSelectAll,
  onEditDriver,
  onViewDetails,
}) => {
  const allSelected = drivers.length > 0 && selectedDrivers.length === drivers.length;

  const getStatusBadge = (status: string, isOnline: boolean) => {
    switch (status.toLowerCase()) {
      case "active":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className={`size-1.5 rounded-full bg-emerald-400 mr-1.5 ${isOnline ? 'animate-pulse' : ''}`} />
            {isOnline ? "Online" : "Active"}
          </span>
        );
      case "inactive":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-700/30 text-slate-400 border border-slate-600/30">
            <span className="size-1.5 rounded-full bg-slate-400 mr-1.5" />
              Inactive
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <span className="size-1.5 rounded-full bg-amber-400 mr-1.5" />
            Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <span className="size-1.5 rounded-full bg-blue-400 mr-1.5" />
            {status}
          </span>
        );
    }
  };

  const getVehicleIcon = (vehicleType: string) => {
    switch (vehicleType.toLowerCase()) {
      case "truck":
        return "local_shipping";
      case "scooter":
        return "two_wheeler";
      case "van":
        return "airport_shuttle";
      default:
        return "directions_car";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Loading drivers...</div>
      </div>
    );
  }

  if (drivers.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">No drivers found</div>
      </div>
    );
  }

  return (
    <table className="w-full text-left border-collapse">
      <thead className="bg-surface-border/30 sticky top-0 z-10 backdrop-blur-sm">
        <tr>
          <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-400 w-16 text-center">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={onSelectAll}
              className="rounded border-slate-600 bg-surface-dark text-[#135bec] focus:ring-offset-surface-dark focus:ring-[#135bec]/50"
            />
          </th>
          <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-400 min-w-[200px]">
            Driver
          </th>
          <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-400 min-w-[200px]">
            Contact Info
          </th>
          <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Status
          </th>
          <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Vehicle
          </th>
          <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-400 text-right">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-surface-border">
        {drivers.map((driver) => (
          <tr
            key={driver._id}
            className="group hover:bg-white/[0.02] transition-colors"
          >
            <td className="py-4 px-4 text-center">
              <input
                type="checkbox"
                checked={selectedDrivers.includes(driver._id)}
                onChange={() => onSelectDriver(driver._id)}
                className="rounded border-slate-600 bg-surface-dark text-[#135bec] focus:ring-offset-surface-dark focus:ring-[#135bec]/50"
              />
            </td>
            <td className="py-4 px-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-slate-700 bg-cover bg-center ring-2 ring-transparent group-hover:ring-[#135bec]/50 transition-all">
                  {/* Add driver image here */}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {driver.first_name} {driver.last_name}
                  </p>
                  <p className="text-xs text-slate-400">ID: {driver._id}</p>
                </div>
              </div>
            </td>
            <td className="py-4 px-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-slate-300 text-sm">
                  <span className="material-symbols-outlined text-[14px] text-slate-500">
                    <MdMail />
                  </span>
                  {driver.email}
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  <span className="material-symbols-outlined text-[14px] text-slate-500">
                      <MdPhone />
                  </span>
                  {driver.auth_user_id?.phone || "N/A"}
                </div>
              </div>
            </td>
            <td className="py-4 px-4">
              {getStatusBadge(driver.status, driver.is_online)}
            </td>
            <td className="py-4 px-4">
              <div className="flex items-center gap-2 text-slate-300 text-sm">
                <span className="material-symbols-outlined text-slate-500">
                  {getVehicleIcon(driver.vehicleType)}
                </span>
                <span>{driver.vehicleType}</span>
              </div>
            </td>
            <td className="py-4 px-4 text-right">
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => onViewDetails(driver)}
                  className="text-[#135bec] hover:text-white hover:bg-[#135bec] px-3 py-1.5 rounded-md text-xs font-bold transition-all border border-transparent hover:border-[#135bec]/50"
                >
                  View Details
                </button>
                <button
                  onClick={() => onEditDriver(driver)}
                  className="text-slate-400 hover:text-white hover:bg-slate-700 px-3 py-1.5 rounded-md text-xs font-bold transition-all border border-transparent hover:border-slate-600"
                >
                  Edit
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default DriverTable;