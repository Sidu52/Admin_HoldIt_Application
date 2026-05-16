import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { storeApi } from "@/app/api";

const useStoresQuery = ({ page = 1, limit = 10, search = "", status = "" }) => {
  return useQuery({
    queryKey: ["stores", page, limit, search || "", status || "all"],
    queryFn: () => storeApi.getStores({ page, limit, search, status }),
    placeholderData: keepPreviousData,
  });
};      

export default useStoresQuery;  