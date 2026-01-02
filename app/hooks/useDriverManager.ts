import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { driverApi } from "@/app/api/client";

// Custom hook to fetch users
export const useDrivers = ({
  page = 1,
  limit = 10,
  status = "",
  search = "",
}: {
  page: number;
  limit: number;
  status: string;
  search: string;
}) => {
  return useQuery({
    queryKey: ["drivers", page, limit, status, search],
    queryFn: () => driverApi.getDrivers(page, limit, status, search),
  });
};

export const usegetDriverById = (id: string) => {
  return useQuery({
    queryKey: ["driverById", id],
    queryFn: () => driverApi.ddriverById(id),
  });
};

// Update User Mutation
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => driverApi.updateDriver(data),
    onSuccess: (updatedDriver) => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      queryClient.invalidateQueries({
        queryKey: ["driverById", updatedDriver._id],
      });
    },
  });
};
