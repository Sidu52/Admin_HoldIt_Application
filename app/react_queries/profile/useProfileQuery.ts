import { useQuery } from "@tanstack/react-query";
import { profileApi } from "@/app/api";

const useProfileQuery = () => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => profileApi.getProfile(),
    enabled: !!profileApi,
  });
};

export default useProfileQuery;