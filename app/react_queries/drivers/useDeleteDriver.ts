import { driversApi } from "@/app/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

const useDeleteDrivers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (driverIds: string[]) => driversApi.deleteDrivers(driverIds),

    onSuccess: () => {
      toast.success("Drivers deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
    },

    onError: () => {
      toast.error("Failed to delete drivers");
    },
  });
};

export default useDeleteDrivers;
