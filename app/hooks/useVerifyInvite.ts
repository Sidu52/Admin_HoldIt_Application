// hooks/useVerifyInvite.ts
import { useQuery } from "@tanstack/react-query";
import { verifyInvviteToken } from "../api/auth";

export const useVerifyInvite = (token: string | null) => {
  console.log("token", token);
  return useQuery({
    queryKey: ["verify-invite", token],
    queryFn: () => {
      if (!token) throw new Error("Token missing");
      return verifyInvviteToken(token);
    },
    enabled: !!token,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
};
