import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { storeOwnerApi } from "@/app/api";
import { UpdateStoreOwnerStatusData } from "@/app/types/storeOwner";

export const useUpdateStoreOwnerStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateStoreOwnerStatusData & { id: string }) =>
      storeOwnerApi.updateStoreOwnerStatus({ ...data }),
    onSuccess: (_, variables) => {
      toast.success("Store owner updated successfully");
      queryClient.invalidateQueries({ queryKey: ["storeOwnerById", variables.id] });
    },
    onError: () => {
      toast.error("Failed to update store owner");
    },
  });
};

export default useUpdateStoreOwnerStatus;