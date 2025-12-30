import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/app/api/client';


export const userProfile = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ['profile', { page, limit }],
    queryFn: () => dashboardApi.getUserProfile(),
  });
};

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