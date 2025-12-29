import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { login, logout, signup } from "@/app/api/auth";
import { verifyToken, verifyInvviteToken } from "@/app/api/auth";
import {
  LoginCredentials,
  AuthResponse,
  SignupCredentials,
  SignupPayload,
} from "@/app/types/auth";
import { useRouter, usePathname } from "next/navigation";

export const useAuth = () => {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const isLoginPage = pathname === "/login";
  // Login
  const loginMutation = useMutation<AuthResponse, Error, LoginCredentials>({
    mutationFn: login,
    onSuccess: (data) => {
      if (data?.data?.user) {
        queryClient.setQueryData(["auth-user"], data.data.user);
      }
      router.push("/dashboard");
    },
  });

  // Signup
  const signupMutation = useMutation<AuthResponse, Error, SignupPayload>({
    mutationFn: signup,
    onSuccess: (data) => {
      if (data?.data?.user) {
        queryClient.setQueryData(["auth-user"], data.data.user);
      }
      router.push("/dashboard");
    },
  });

  // Verify session
  const verifyQuery = useQuery({
    queryKey: ["auth-user"],
    queryFn: verifyToken,
    retry: false,
    staleTime: 5 * 60 * 1000,
    enabled: !isLoginPage,
  });

  // Logout
  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear();
      router.push("/login");
    },
    onError: () => {
      queryClient.clear();
      router.push("/login");
    },
  });

  return {
    user: verifyQuery.data,
    isLoading: loginMutation.isPending || verifyQuery.isLoading,
    isAuthenticated: verifyQuery.isSuccess,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    signup: signupMutation.mutate,
    error:
      loginMutation.error?.message || (verifyQuery.error as Error)?.message,
  };
};
