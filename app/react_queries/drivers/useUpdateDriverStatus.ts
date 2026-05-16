import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { driversApi } from "@/app/api";
import { UpdateDriverStatusData } from "@/app/types/driver";

export const useUpdateDriverStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateDriverStatusData & { id: string }) =>
      driversApi.updateDriverStatus({ ...data }), 
    onSuccess: (_, variables) => {
      toast.success("Driver updated successfully");
      queryClient.invalidateQueries({ queryKey: ["driverById", variables.id] });
    },
    onError: () => {
      toast.error("Failed to update driver");
    },
  });
};

export default useUpdateDriverStatus;
