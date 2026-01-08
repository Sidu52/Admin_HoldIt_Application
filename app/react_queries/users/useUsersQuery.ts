import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { usersApi } from "@/app/api";

const useUsersQuery = ({ page = 1, limit = 10, search = "", status = "" }) => {
  return useQuery({
    queryKey: ["users", page, limit, search || "", status || "all"],
    queryFn: () => usersApi.getUsers({ page, limit, search, status }),
    placeholderData: keepPreviousData,
  });
};

export default useUsersQuery;
