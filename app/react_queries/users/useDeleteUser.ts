import { usersApi } from "@/app/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

const useDeleteUsers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userIds: string[]) => usersApi.deleteUsers(userIds),

    onSuccess: () => {
      toast.success("Users deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },

    onError: () => {
      toast.error("Failed to delete users");
    },
  });
};

export default useDeleteUsers;
