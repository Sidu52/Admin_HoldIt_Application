import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { storeOwnerApi } from "@/app/api";  

 const useStoreOwnerQuery = ({ page = 1, limit = 10, search = "", status = "" }) => {
    return useQuery({
      queryKey: ["storeOwners", page, limit, search || "", status || "all"],
      queryFn: () => storeOwnerApi.getStoreOwners({ page, limit, search, status }),
      placeholderData: keepPreviousData,
    });
  };
  
  export default useStoreOwnerQuery;
