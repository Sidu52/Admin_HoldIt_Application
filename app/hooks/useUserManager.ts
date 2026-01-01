import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/app/api/client";

// Custom hook to fetch users
export const useUsers = ({
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
    queryKey: ["users", page, limit, status, search],
    queryFn: () => usersApi.getUsers(page, limit, status, search),
  });
};

export const usegetUserById = (id: string) => {
  return useQuery({
    queryKey: ["userById", id],
    queryFn: () => usersApi.userById(id),
  });
};

// Update User Mutation
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => usersApi.updateUser(data),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({
        queryKey: ["userById", updatedUser._id],
      });
    },
  });
};
