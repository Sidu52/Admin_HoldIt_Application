import { useMutation, useQueryClient } from "@tanstack/react-query";
import { storeOwnerApi } from "@/app/api";
import { toast } from "react-hot-toast";

// Custom hook for updating a user

export const useDeleteStoreOwner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => storeOwnerApi.deleteStoreOwners(ids),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["storeOwners"] });
    },

    onError: () => {
      toast.error("Failed to delete store owners");
    },
  });
};

export default useDeleteStoreOwner;