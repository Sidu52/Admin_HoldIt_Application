import { useMutation, useQueryClient } from "@tanstack/react-query";
import { refreshToken } from "@/app/api/auth";


export const useRefreshToken = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: refreshToken,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error) => {
      console.error("Token refresh failed:", error);
    },
  });
};
