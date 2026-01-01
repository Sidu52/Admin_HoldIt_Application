import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  iconBgColor?: string;
  iconColor?: string;
  stats?: {
    label: string;
    value: number | string;
    bgColor?: string;
    textColor?: string;
  }[];
  emptyStateText?: string; // Optional: Custom text for "no data" state
  emptyStateIcon?: ReactNode; // Optional: Custom icon for "no data" state
}

const StatCard = ({
  title,
  value,
  icon,
  iconBgColor = "bg-slate-100 dark:bg-slate-800",
  iconColor = "text-slate-600 dark:text-slate-300",
  stats = [],
  emptyStateText = "No data available", // Default "No data available" message
  emptyStateIcon = <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-4xl mb-2">info</span>, // Default "info" icon
}: StatCardProps) => {
  return (
    <div className="relative flex flex-col gap-3 rounded-xl p-5 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden group">
      {/* Empty State (if no data is available) */}
      <div className="hidden absolute inset-0 z-10 bg-white/80 dark:bg-[#1e293b]/80 backdrop-blur-sm flex-col items-center justify-center text-center p-4 group-hover:flex">
        {emptyStateIcon}
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{emptyStateText}</p>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</p>
        <div className={`p-1.5 rounded-md ${iconBgColor} ${iconColor}`}>
          {icon}
        </div>
      </div>

      {/* Main Value */}
      <p className="text-slate-900 dark:text-white text-3xl font-bold">{value}</p>

      {/* Status Blocks */}
      {stats.length > 0 && (
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
          {stats.map((item, idx) => (
            <div
              key={idx}
              className={`rounded-md px-2 py-1 text-xs font-medium ${item.bgColor ?? "bg-slate-100 dark:bg-slate-800"} ${item.textColor ?? "text-slate-600 dark:text-slate-300"}`}
            >
              <p className="leading-tight">{item.label}</p>
              <p className="font-semibold text-sm">{item.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StatCard;
