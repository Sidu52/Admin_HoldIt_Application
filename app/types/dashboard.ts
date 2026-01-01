import { ReactNode } from "react";

export interface StatItem {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconColor: string;
  iconBgColor: string;
  trend: {
    value: string;
    isPositive: boolean;
    label: string;
  };
}

export interface Activity {
  id: string;
  bookingId: string;
  userName: string;
  userEmail: string;
  userAvatar: string;
  status: "completed" | "in-progress" | "pending" | "cancelled";
  bookingTime: string;
}

export interface ChartData {
  day: string;
  value: number;
  maxValue: number;
}

// Stats
export type StatsCardItem = {
  label: string;
  value: number;
  bgColor: string;
  textColor: string;
};

export type StatsCard = {
  title: string;
  value: number;
  icon: ReactNode;
  iconBgColor: string;
  iconColor: string;
  stats: StatsCardItem[];
};

export type Stats = {
  booking: {
    totalToday: number;
    inProgress: number;
    completed: number;
  };
  users: {
    total: number;
    newToday: number;
  };
  drivers: {
    total: number;
    online: number;
    offline: number;
  };
  stores: {
    total: number;
    online: number;
    offline: number;
  };
};