import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { storeApi } from "@/app/api";

const useGetStoreByIdQuery = (id: string) => {
  return useQuery({
    queryKey: ["storeById", id],
    queryFn: () => storeApi.getStoreById(id),
    enabled: !!id,
    placeholderData: keepPreviousData,
  });
};  

export default useGetStoreByIdQuery;