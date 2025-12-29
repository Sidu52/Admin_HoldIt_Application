interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend: {
    value: string;
    isPositive: boolean;
    label: string;
  };
  color: "blue" | "purple" | "orange" | "green" | "red";
  isLoading?: boolean;
}

export default function StatCard({
  title,
  value,
  icon,
  trend,
  color,
  isLoading = false,
}: StatCardProps) {
  const colorClasses = {
    blue: "bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400",
    purple:
      "bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400",
    orange:
      "bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400",
    green:
      "bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400",
    red: "bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400",
  };

  const trendIcon = trend.isPositive ? "↗" : "↘";

  return (
    <div className="flex flex-col gap-3 rounded-xl p-5 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
          {title}
        </p>
        <div className={`p-1.5 rounded-md ${colorClasses[color]}`}>{icon}</div>
      </div>

      <div>
        {isLoading ? (
          <div className="h-9 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
        ) : (
          <>
            <p className="text-slate-900 dark:text-white text-3xl font-bold">
              {value}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <span
                className={`
                text-sm font-medium
                ${trend.isPositive ? "text-emerald-500" : "text-rose-500"}
              `}
              >
                {trendIcon} {trend.value}
              </span>
              <span className="text-slate-400 text-xs ml-1">{trend.label}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
