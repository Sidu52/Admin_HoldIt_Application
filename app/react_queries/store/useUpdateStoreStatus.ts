import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { UpdateStoreStatusData } from "@/app/types/store";
import { storeApi } from "@/app/api";

const useUpdateStoreStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateStoreStatusData & { id: string }) =>
      storeApi.updateStoreStatus({ ...data }),
    onSuccess: (_, variables) => {
      toast.success("Store updated successfully");
      queryClient.invalidateQueries({ queryKey: ["storeById", variables.id] });
    },
    onError: () => {
      toast.error("Failed to update store");
    },
  });
};      

export default useUpdateStoreStatus;
