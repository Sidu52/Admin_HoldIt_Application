import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { teamApi } from "@/app/api";

const useTeamMemberByIdQuery = (id: string) => {
    return useQuery({
        queryKey: ["teamMemberById", id],
        queryFn: () => teamApi.getTeamMemberById(id),
        enabled: !!id,
        placeholderData: keepPreviousData,
    });
};

export default useTeamMemberByIdQuery;