import React from "react";
import { Driver } from "@/app/types/driver";

interface DriverContactLicenseProps {
  driver: Driver;
}

const DriverContactLicense: React.FC<DriverContactLicenseProps> = ({ driver }) => {
  return (
    <section className="rounded-xl bg-card-dark border border-border-dark overflow-hidden">
      <div className="border-b border-border-dark px-6 py-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">id_card</span>
          License & Contact
        </h3>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 gap-y-6 gap-x-8 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-text-secondary">
              Email Address
            </p>
            <a
              className="mt-1 inline-flex items-center gap-2 text-base font-medium text-primary hover:text-blue-400"
              href={`mailto:${driver.email}`}
            >
              {driver.email}
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            </a>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-text-secondary">
              Phone Number
            </p>
            <a
              className="mt-1 inline-flex items-center gap-2 text-base font-medium text-white hover:text-primary transition"
              href={`tel:${driver.auth_user_id?.phone || ""}`}
            >
              {driver.auth_user_id?.phone ? `+${driver.auth_user_id.phone}` : "N/A"}
            </a>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-text-secondary">
              License Number
            </p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-base font-medium text-white font-mono">
                {driver.licenseNumber || "N/A"}
              </p>
              {driver.verification_status === "verified" && (
                <span
                  className="material-symbols-outlined text-emerald-500 text-[18px]"
                  title="Verified"
                >
                  verified
                </span>
              )}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-text-secondary">
              Last Login
            </p>
            <p className="mt-1 text-base font-medium text-white">
              {driver.auth_user_id?.last_login_at
                ? new Date(driver.auth_user_id.last_login_at).toLocaleDateString()
                : "Never"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-text-secondary">
              Account Created
            </p>
            <p className="mt-1 text-base font-medium text-white">
              {new Date(driver.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-text-secondary">
              Last Updated
            </p>
            <p className="mt-1 text-base font-medium text-white">
              {new Date(driver.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DriverContactLicense;