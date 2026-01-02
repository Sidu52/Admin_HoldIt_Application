import { Driver } from "@/app/types/driverManager";
import { formatDateTime } from "@/app/utils/helper";
import React from "react";

const AccountDetails = ({ driver }: { driver: Driver }) => {
  const DetailRow = ({
    label,
    value,
  }: {
    label: string;
    value?: React.ReactNode;
  }) => (
    <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
      <span className="text-sm text-slate-500 dark:text-slate-400">
        {label}
      </span>
      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
        {value || "-"}
      </span>
    </div>
  );

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Account Details
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Driver profile & account information
        </p>
      </div>

      {/* Content */}
      <div className="px-5 py-4 space-y-1">
        <DetailRow label="Driver ID" value={driver._id} />
        <DetailRow label="Phone" value={driver?.auth_user_id?.phone} />
        <DetailRow label="Email" value={driver.email} />
        <DetailRow
          label="Name"
          value={`${driver.first_name} ${driver.last_name}`}
        />
        <DetailRow label="Gender" value={driver.gender} />
        <DetailRow
          label="Date of Birth"
          value={formatDateTime(driver.dob, "date")}
        />
        <DetailRow
          label="Account Status"
          value={
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                driver.status === "active"
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              }`}
            >
              {driver.status}
            </span>
          }
        />
        {driver?.auth_user_id?.last_login_at && (
          <DetailRow
            label="Last Login"
            value={formatDateTime(driver.auth_user_id.last_login_at)}
          />
        )}
        {driver.createdAt && (
          <DetailRow
            label="Signup Time"
            value={formatDateTime(driver.createdAt)}
          />
        )}
        {driver.updatedAt && (
          <DetailRow
            label="Last Updated"
            value={formatDateTime(driver.updatedAt)}
          />
        )}
      </div>
    </div>
  );
};

export default AccountDetails;
