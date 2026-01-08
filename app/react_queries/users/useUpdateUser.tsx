import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { UserUpdateData } from "@/app/types/user";
import { usersApi } from "@/app/api";

// Custom hook for updating a user

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn now expects a single object { id, ...data }
    mutationFn: (data: UserUpdateData & { id: string }) =>
      usersApi.updateUser({ ...data }), // send {id, first_name, last_name...} directly
    onSuccess: (_, variables) => {
      toast.success("User updated successfully");
      queryClient.invalidateQueries({ queryKey: ["user", variables.id] });
    },
    onError: () => {
      toast.error("Failed to update user");
    },
  });
};

export default useUpdateUser;
