import { api } from "@/app/lib/axios";
import {
  LoginCredentials,
  AuthResponse,
  User,
  SignupCredentials,
  SignupPayload,
} from "@/app/types/auth";

export const login = async (
  credentials: LoginCredentials
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/login", credentials);
  return response.data;
};
export const signup = async (payload: SignupPayload): Promise<AuthResponse> => {
  const { token, credentials } = payload;
  const response = await api.post<AuthResponse>("/auth/signup", credentials, {
    params: { token },
  });

  return response.data;
};

export const refreshToken = async (): Promise<any> => {
  const response = await api.post<any>("/auth/refresh");
  return response.data;
};

export const verifyToken = async (): Promise<User> => {
  const response = await api.get<User>("/auth/verify");
  return response.data;
};

export const verifyInvviteToken = async (token: string) => {
  const response = await api.get("/auth/verify-invite", {
    params: { token },
  });
  return response.data;
};

export const logout = async (): Promise<void> => {
  await api.post("/auth/logout");
};
