import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { storeOwnerApi } from "@/app/api";

const useGetStoreOwnerById = (id: string) => {
  return useQuery({
    queryKey: ["storeOwnerById", id],
    queryFn: () => storeOwnerApi.getStoreOwnerById(id),
    enabled: !!id,
    placeholderData: keepPreviousData,
  });
};

export default useGetStoreOwnerById;