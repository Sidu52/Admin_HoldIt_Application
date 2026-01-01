import { User } from "@/app/types/usermanager";
import { formatDateTime, parseTimestamp } from "@/app/utils/helper";
import React from "react";

const AccountDetails = ({ user }: { user: User }) => {
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
          User profile & account information
        </p>
      </div>

      {/* Content */}
      <div className="px-5 py-4 space-y-1">
        <DetailRow label="User ID" value={user._id} />
        <DetailRow label="Phone" value={user?.auth_user_id?.phone} />
        <DetailRow label="Email" value={user.email} />
        <DetailRow
          label="Name"
          value={`${user.first_name} ${user.last_name}`}
        />
        <DetailRow label="Gender" value={user.gender} />
        <DetailRow
          label="Date of Birth"
          value={formatDateTime(user.dob, "date")}
        />
        <DetailRow
          label="Account Status"
          value={
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                user.status === "active"
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              }`}
            >
              {user.status}
            </span>
          }
        />
        {user?.auth_user_id?.last_login_at && (
          <DetailRow
            label="Last Login"
            value={formatDateTime(user.auth_user_id.last_login_at)}
          />
        )}
        {user.createdAt && (
          <DetailRow
            label="Signup Time"
            value={formatDateTime(user.createdAt)}
          />
        )}
        {user.updatedAt && (
          <DetailRow
            label="Last Updated"
            value={formatDateTime(user.updatedAt)}
          />
        )}
      </div>
    </div>
  );
};

export default AccountDetails;
