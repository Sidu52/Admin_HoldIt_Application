import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { driversApi } from "@/app/api";

const useDriversQuery = ({ page = 1, limit = 10, search = "", status = "" }) => {
  return useQuery({
    queryKey: ["drivers", page, limit, search || "", status || "all"],
    queryFn: () => driversApi.getDrivers({ page, limit, search, status }),
    placeholderData: keepPreviousData,
  });
};

export default useDriversQuery;
