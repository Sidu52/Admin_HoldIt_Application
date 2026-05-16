import { useMutation, useQueryClient } from "@tanstack/react-query";
import { teamApi } from "@/app/api";
import { toast } from "react-hot-toast";

// Custom hook for updating a user
 const useDeleteTeamMember = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (ids: string[]) => teamApi.deleteTeamMembers(ids),

        onSuccess: () => {
            toast.success("Team members deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["teamMembers"] });
        },

        onError: () => {
            toast.error("Failed to delete team members");
        },
    });
};

export default useDeleteTeamMember;