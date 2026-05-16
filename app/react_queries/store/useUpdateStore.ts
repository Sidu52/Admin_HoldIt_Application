import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { storeApi } from "@/app/api";
import { StoreUpdateData } from "@/app/types/store";

export const useUpdateStore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StoreUpdateData & { id: string }) =>
      storeApi.updateStore({ ...data }),
    onSuccess: (_, variables) => {
      toast.success("Store updated successfully");
      queryClient.invalidateQueries({ queryKey: ["storeById", variables.id] });
    },
    onError: () => {
      toast.error("Failed to update store");
    },
  });
};      

export default useUpdateStore;