import React from "react";
import { Driver } from "@/app/types/driver";

interface DriverActionsProps {
  driver: Driver;
  onEdit: () => void;
  onSuspend: () => void;
  onViewDocuments: () => void;
  onSendMessage: () => void;
}

const DriverActions: React.FC<DriverActionsProps> = ({
  driver,
  onEdit,
  onSuspend,
  onViewDocuments,
  onSendMessage,
}) => {
  const actions = [
    {
      label: "View Documents",
      icon: "description",
      onClick: onViewDocuments,
      variant: "secondary" as const,
    },
    {
      label: "Send Message",
      icon: "send",
      onClick: onSendMessage,
      variant: "secondary" as const,
    },
    {
      label: "View Trip History",
      icon: "history",
      onClick: () => {/* Navigate to trip history */},
      variant: "secondary" as const,
    },
    {
      label: "View Earnings",
      icon: "attach_money",
      onClick: () => {/* Navigate to earnings */},
      variant: "secondary" as const,
    },
    {
      label: "Reset Password",
      icon: "lock_reset",
      onClick: () => {/* Handle reset password */},
      variant: "warning" as const,
    },
    {
      label: "Deactivate Account",
      icon: "person_remove",
      onClick: onSuspend,
      variant: "danger" as const,
      disabled: driver.status === "suspended",
    },
  ];

  const getVariantClasses = (variant: "secondary" | "warning" | "danger") => {
    switch (variant) {
      case "warning":
        return "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/20";
      case "danger":
        return "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20";
      default:
        return "bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 border-slate-700/50";
    }
  };

  return (
    <section className="rounded-xl bg-card-dark border border-border-dark overflow-hidden">
      <div className="border-b border-border-dark px-6 py-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">settings</span>
          Quick Actions
        </h3>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 gap-3">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              disabled={action.disabled}
              className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${getVariantClasses(
                action.variant
              )}`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {action.icon}
              </span>
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DriverActions;