import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { usersApi } from "@/app/api";

const useUserByIdQuery = (id: string) => {
  return useQuery({
    queryKey: ["user", id],
    queryFn: () => usersApi.userById(id),
    enabled: !!id,
    placeholderData: keepPreviousData,
  });
};

export default useUserByIdQuery;
