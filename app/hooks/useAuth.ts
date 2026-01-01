import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { login, logout, signup } from "@/app/api/auth";
import { verifyToken, verifyInvviteToken } from "@/app/api/auth";
import {
  LoginCredentials,
  AuthResponse,
  SignupPayload,
} from "@/app/types/auth";
import { useRouter, usePathname } from "next/navigation";
import { useAppDispatch } from "../store/hooks";

export const useAuth = () => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const isLoginPage = pathname === "/login";
  // Login
  const loginMutation = useMutation<AuthResponse, any, LoginCredentials>({
    mutationFn: login,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] }); // Invalidate user profile query
      router.push("/dashboard");
    },
  });

  // Signup
  const signupMutation = useMutation<AuthResponse, any, SignupPayload>({
    mutationFn: signup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      router.push("/login");
    },
  });

  // Verify session
  const verifyQuery = useQuery({
    queryKey: ["auth-verify"],
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
    isLoading: verifyQuery.isLoading,
    isAuthenticated: verifyQuery.isSuccess,
    login: loginMutation.mutate,
    loginIsLoading: loginMutation.isPending,
    loginSuccess: loginMutation.isSuccess,
    loginError: loginMutation.error?.response?.data?.message,
    logout: logoutMutation.mutate,
    logoutSuccess: logoutMutation.isSuccess,
    logoutLoading: logoutMutation.isPending,
    signup: signupMutation.mutate,
    error: verifyQuery.error?.message,
  };
};
