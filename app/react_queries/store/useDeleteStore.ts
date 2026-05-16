import { useMutation, useQueryClient } from "@tanstack/react-query";
import { storeApi } from "@/app/api";
import { toast } from "react-hot-toast";

// Custom hook for updating a user

export const useDeleteStore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => storeApi.deleteStores(ids),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
    },

    onError: () => {
      toast.error("Failed to delete stores");
    },
  });
};

export default useDeleteStore;