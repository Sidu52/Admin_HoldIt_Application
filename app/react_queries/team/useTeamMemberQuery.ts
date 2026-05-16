import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { teamApi } from "@/app/api";

const useTeamMemberQuery = ({ page = 1, limit = 10, search = "", status = "" }) => {
    return useQuery({
        queryKey: ["teamMembers", page, limit, search || "", status || "all"],
        queryFn: () => teamApi.getTeamMembers({ page, limit, search, status }),
        placeholderData: keepPreviousData,
    });
};

export default useTeamMemberQuery;