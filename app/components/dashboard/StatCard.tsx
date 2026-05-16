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
  emptyStateText?: string;
  emptyStateIcon?: ReactNode;
}

const StatCard = ({
  title,
  value,
  icon,
  iconBgColor = "bg-primary/10",
  iconColor = "text-primary",
  stats = [],
  emptyStateText = "No data available",
  emptyStateIcon,
}: StatCardProps) => {
  return (
    <div className="card-premium p-6 group relative overflow-hidden">
      {/* Background Accent */}
      <div className={`absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${iconBgColor}`}></div>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col gap-1">
          <p className="text-text-muted-light dark:text-text-muted-dark text-xs font-bold uppercase tracking-widest">{title}</p>
          <p className="text-text-main-light dark:text-text-main-dark text-3xl font-extrabold font-display tracking-tight leading-none">{value}</p>
        </div>
        <div className={`h-12 w-12 flex items-center justify-center rounded-2xl shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${iconBgColor} ${iconColor}`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>

      {/* Stats Breakdown */}
      {stats.length > 0 && (
        <div className="flex gap-3 pt-4 border-t border-border-light dark:border-border-dark mt-2">
          {stats.map((item, idx) => (
            <div
              key={idx}
              className="flex-1 flex flex-col gap-0.5"
            >
              <p className="text-[10px] font-bold text-text-muted-light dark:text-text-muted-dark uppercase tracking-wider">{item.label}</p>
              <div className="flex items-baseline gap-1">
                <span className={`text-sm font-bold ${item.textColor ?? "text-text-main-light dark:text-text-main-dark"}`}>{item.value}</span>
                {/* Optional trend indicator can be added here */}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State Overlay (if needed) */}
      {!value && value !== 0 && (
        <div className="absolute inset-0 z-10 bg-surface-light/90 dark:bg-surface-dark/90 backdrop-blur-[2px] flex flex-col items-center justify-center text-center p-4">
          <p className="text-xs font-bold text-text-muted-light dark:text-text-muted-dark uppercase tracking-widest">{emptyStateText}</p>
        </div>
      )}
    </div>
  );
};

export default StatCard;

