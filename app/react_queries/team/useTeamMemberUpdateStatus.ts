import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { teamApi } from "@/app/api";
import { UpdateTeamMemberStatus } from "@/app/types/team";

const useTeamMemberUpdateStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateTeamMemberStatus & { id: string }) =>
            teamApi.updateTeamMemberStatus({ ...data }),
        onSuccess: (_, variables) => {
            toast.success("Team member updated successfully");
            queryClient.invalidateQueries({ queryKey: ["teamMemberById", variables.id] });
        },
        onError: () => {
            toast.error("Failed to update team member");
        },
    });
};

export default useTeamMemberUpdateStatus;