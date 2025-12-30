"use client";

import { ReactNode } from "react";
import { FaArrowUp } from "react-icons/fa";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  iconColor: string;
  iconBgColor: string;
  trend: {
    value: string;
    isPositive: boolean;
    label: string;
  };
}

const StatCard = ({ title, value, icon, iconColor, iconBgColor, trend }: StatCardProps) => {
  return (
    <div className="flex flex-col gap-3 rounded-xl p-5 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</p>
        <div className={`p-1.5 rounded-md ${iconBgColor} ${iconColor}`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-slate-900 dark:text-white text-3xl font-bold">{value}</p>
        <div className="flex items-center gap-1 mt-1">
          <FaArrowUp className={`text-sm ${trend.isPositive ? 'text-emerald-500' : 'text-red-500'}`} />
          <p className={`text-sm font-medium ${trend.isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
            {trend.value}
          </p>
          <span className="text-slate-400 text-xs ml-1">{trend.label}</span>
        </div>
      </div>
    </div>
  );
};

export default StatCard;