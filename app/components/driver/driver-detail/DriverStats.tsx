import React from "react";
import { Driver } from "@/app/types/driver";

interface DriverStatsProps {
  driver: Driver;
}

const DriverStats: React.FC<DriverStatsProps> = ({ driver }) => {
  // Mock stats - in real app, these would come from API
  const stats = [
    {
      label: "Average Rating",
      value: "4.8",
      icon: "star",
      color: "yellow",
      description: "Based on 1240 trips",
    },
    {
      label: "Total Trips",
      value: "1,240",
      icon: "route",
      color: "blue",
      description: "Completed this month: 42",
    },
    {
      label: "Acceptance Rate",
      value: "98%",
      icon: "check_circle",
      color: "emerald",
      description: "Last 30 days",
    },
    {
      label: "Response Time",
      value: "2.4 min",
      icon: "timer",
      color: "purple",
      description: "Average response time",
    },
  ];

  const getColorClass = (color: string) => {
    switch (color) {
      case "yellow":
        return "bg-yellow-500/10 text-yellow-500";
      case "blue":
        return "bg-blue-500/10 text-blue-500";
      case "emerald":
        return "bg-emerald-500/10 text-emerald-500";
      case "purple":
        return "bg-purple-500/10 text-purple-500";
      default:
        return "bg-slate-500/10 text-slate-500";
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="flex flex-col rounded-xl bg-card-dark p-5 border border-border-dark hover:border-border-light transition-colors"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-text-secondary">{stat.label}</p>
              <p className="mt-2 text-3xl font-bold text-white">{stat.value}</p>
              <p className="mt-1 text-xs text-text-secondary">{stat.description}</p>
            </div>
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${getColorClass(stat.color)}`}>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                {stat.icon}
              </span>
            </div>
          </div>
          {/* Progress bar for acceptance rate */}
          {stat.label === "Acceptance Rate" && (
            <div className="mt-3">
              <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: "98%" }}
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default DriverStats;