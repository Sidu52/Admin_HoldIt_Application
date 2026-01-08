import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { UpdateUserStatusData } from "@/app/types/user";
import { usersApi } from "@/app/api";

// Custom hook for updating a user

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserStatusData & { id: string }) =>
      usersApi.updateUserStatus({ ...data }), 
    onSuccess: (_, variables) => {
      toast.success("User updated successfully");
      queryClient.invalidateQueries({ queryKey: ["user", variables.id] });
    },
    onError: () => {
      toast.error("Failed to update user");
    },
  });
};

export default useUpdateUserStatus;
