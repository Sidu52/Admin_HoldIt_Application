import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { driversApi } from "@/app/api";

const useDriverByIdQuery = (id: string) => {
  return useQuery({
    queryKey: ["driverById", id],
    queryFn: () => driversApi.getDriverById(id),
    enabled: !!id,
    placeholderData: keepPreviousData,
  });
};

export default useDriverByIdQuery;
