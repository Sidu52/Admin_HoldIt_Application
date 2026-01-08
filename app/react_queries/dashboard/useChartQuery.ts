import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/app/api";

interface ChartParams {
  entity: string;
  range: string;
}

 const useChartQuery = ({ entity, range }: ChartParams) => {
  return useQuery({
    queryKey: ["chart", entity, range],
    queryFn: () => dashboardApi.getChart({ entity, range }),
    enabled: !!entity && !!range, 
  });
};

export default useChartQuery;