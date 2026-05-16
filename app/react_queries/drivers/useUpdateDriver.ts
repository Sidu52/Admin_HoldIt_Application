import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { driversApi } from "@/app/api";
import { DriverUpdateData } from "@/app/types/driver";

export const useUpdateDriver = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DriverUpdateData & { id: string }) =>
      driversApi.updateDriver({ ...data }),
    onSuccess: (_, variables) => {
      toast.success("Driver updated successfully");
      queryClient.invalidateQueries({ queryKey: ["driverById", variables.id] });
    },
    onError: () => {
      toast.error("Failed to update driver");
    },
  });
};

export default useUpdateDriver;
