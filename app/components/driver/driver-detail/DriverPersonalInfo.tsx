'use client';
import React from "react";
import { Driver } from "@/app/types/driver";
import { formatDateTime } from "@/app/utils/helper";

interface DriverPersonalInfoProps {
  driver: Driver;
}

const DriverPersonalInfo: React.FC<DriverPersonalInfoProps> = ({ driver }) => {
  const formatDOB = (dob: string) => {
    try {
      return formatDateTime(dob, 'date');
    } catch {
      return dob;
    }
  };

  return (
    <section className="rounded-xl bg-card-dark border border-border-dark overflow-hidden">
      <div className="border-b border-border-dark px-6 py-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">person</span>
          Personal Information
        </h3>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 gap-y-6 gap-x-8 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-text-secondary">
              Full Name
            </p>
            <p className="mt-1 text-base font-medium text-white">
              {driver.first_name} {driver.last_name}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-text-secondary">
              Date of Birth
            </p>
            <p className="mt-1 text-base font-medium text-white">
              {formatDOB(driver.dob)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-text-secondary">
              Gender
            </p>
            <p className="mt-1 text-base font-medium text-white capitalize">
              {driver.gender}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-text-secondary">
              Address
            </p>
            <p className="mt-1 text-base font-medium text-white line-clamp-2">
              {driver.address || "Not provided"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-text-secondary">
              Verification Status
            </p>
            <div className="mt-1 flex items-center gap-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  driver.verification_status === "verified"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : driver.verification_status === "pending"
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                }`}
              >
                {driver.verification_status.charAt(0).toUpperCase() + 
                 driver.verification_status.slice(1)}
              </span>
              {driver.verification_status === "verified" && (
                <span className="material-symbols-outlined text-emerald-500 text-[18px]">
                  verified
                </span>
              )}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-text-secondary">
              Service Status
            </p>
            <div className="mt-1">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  driver.is_serviceable
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                }`}
              >
                {driver.is_serviceable ? "Serviceable" : "Not Serviceable"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DriverPersonalInfo;