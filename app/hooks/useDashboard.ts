import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/app/api/client";

export const userProfile = () => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => dashboardApi.getUserProfile(),
  });
};

export const summary = () => {
  return useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: () => dashboardApi.getSummary(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const chart = (entity:string,range:string) => {
  return useQuery({
    queryKey: ["chart"],
    queryFn: () => dashboardApi.getChart({entity,range}),
    staleTime: 5 * 60 * 1000,
  })
}



// export const users = (page: number = 1, limit: number = 10) => {
//   return useQuery({
//     queryKey: ['users', { page, limit }],
//     queryFn: () => dashboardApi.getUserProfile(page, limit),
//   });
// };

// export const useDashboardStats = () => {
//   return useQuery({
//     queryKey: ['dashboard', 'stats'],
//     queryFn: () => dashboardApi.getStats(),
//     staleTime: 5 * 60 * 1000, // 5 minutes
//   });
// };

// export const useUser = (id: string) => {
//   return useQuery({
//     queryKey: ['user', id],
//     queryFn: () => dashboardApi.getUser(id),
//     enabled: !!id,
//   });
// };
