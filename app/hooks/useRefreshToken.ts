import { useMutation, useQueryClient } from "@tanstack/react-query";
import { refreshToken } from "@/app/api/auth";
import { setAuthTokens } from "@/app/utils/cookies";

export const useRefreshToken = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: refreshToken,
    onSuccess: (data) => {
      const { accessToken, expiresIn } = data?.data;
      setAuthTokens(accessToken, expiresIn);
      // Refetch user data
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error) => {
      console.error("Token refresh failed:", error);
    },
  });
};
