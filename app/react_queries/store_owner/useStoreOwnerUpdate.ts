import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { storeOwnerApi } from "@/app/api";
import { StoreOwnerUpdateData } from "@/app/types/storeOwner";

const useStoreOwnerUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StoreOwnerUpdateData & { id: string }) =>
      storeOwnerApi.updateStoreOwner({ ...data }),
    onSuccess: (_, variables) => {
      toast.success("Store owner updated successfully");
      queryClient.invalidateQueries({ queryKey: ["storeOwnerById", variables.id] });
    },
    onError: () => {
      toast.error("Failed to update store owner");
    },
  });
};  

export default useStoreOwnerUpdate
