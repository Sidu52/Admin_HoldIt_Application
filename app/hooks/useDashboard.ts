import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/app/api/client';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => dashboardApi.getStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUsers = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ['users', { page, limit }],
    queryFn: () => dashboardApi.getUsers(page, limit),
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => dashboardApi.getUser(id),
    enabled: !!id,
  });
};