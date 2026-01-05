import React from "react";
import { Driver } from "@/app/types/driver";

interface DriverVehicleInfoProps {
  driver: Driver;
}

const DriverVehicleInfo: React.FC<DriverVehicleInfoProps> = ({ driver }) => {
  const getVehicleColor = (vehicleType: string) => {
    switch (vehicleType.toLowerCase()) {
      case "car":
        return "bg-blue-500";
      case "van":
        return "bg-purple-500";
      case "truck":
        return "bg-amber-500";
      case "scooter":
        return "bg-emerald-500";
      default:
        return "bg-slate-500";
    }
  };

  const getVehicleIcon = (vehicleType: string) => {
    switch (vehicleType.toLowerCase()) {
      case "car":
        return "directions_car";
      case "van":
        return "airport_shuttle";
      case "truck":
        return "local_shipping";
      case "scooter":
        return "two_wheeler";
      default:
        return "directions_car";
    }
  };

  return (
    <section className="h-full rounded-xl bg-card-dark border border-border-dark overflow-hidden flex flex-col">
      <div className="border-b border-border-dark px-6 py-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">
            {getVehicleIcon(driver.vehicleType)}
          </span>
          Assigned Vehicle
        </h3>
      </div>
      <div className="relative h-48 w-full bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`text-white text-6xl opacity-20 ${getVehicleColor(driver.vehicleType)} p-8 rounded-full`}>
            <span className="material-symbols-outlined">
              {getVehicleIcon(driver.vehicleType)}
            </span>
          </div>
        </div>
        <div className="absolute bottom-3 right-3 rounded bg-black/60 px-2 py-1 text-xs font-bold text-white backdrop-blur-sm">
          {driver.is_serviceable ? "Active Vehicle" : "Inactive Vehicle"}
        </div>
      </div>
      <div className="flex-1 p-6">
        <div className="flex flex-col gap-5">
          <div className="flex justify-between items-center border-b border-border-dark pb-3">
            <span className="text-text-secondary text-sm">Vehicle Type</span>
            <span className="text-white font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">
                {getVehicleIcon(driver.vehicleType)}
              </span>
              {driver.vehicleType}
            </span>
          </div>
          <div className="flex justify-between items-center border-b border-border-dark pb-3">
            <span className="text-text-secondary text-sm">Registration</span>
            <span className="text-white font-semibold">Not specified</span>
          </div>
          <div className="flex justify-between items-center border-b border-border-dark pb-3">
            <span className="text-text-secondary text-sm">Year</span>
            <span className="text-white font-semibold">-</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-text-secondary text-sm">Insurance Status</span>
            <span className="text-white font-medium">
              <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
                Valid
              </span>
            </span>
          </div>
          <div className="mt-4">
            <button className="w-full rounded-lg border border-border-dark bg-[#232f48] py-2.5 text-sm font-bold text-white transition hover:bg-[#324467]">
              View Vehicle Documents
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DriverVehicleInfo;