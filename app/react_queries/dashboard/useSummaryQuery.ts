import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/app/api";

const useSummaryQuery = () => {
  return useQuery({
    queryKey: ["summary"],
    queryFn: () => dashboardApi.getSummary(),
  });
};

export default useSummaryQuery;