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