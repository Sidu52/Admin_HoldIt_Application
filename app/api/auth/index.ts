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
  const response = await api.post<AuthResponse>("/admin/login", credentials);
  return response.data;
};
export const signup = async (payload: SignupPayload): Promise<AuthResponse> => {
  const { token, credentials } = payload;
  console.log("token", token);
  console.log("credentials", credentials);
  const response = await api.post<AuthResponse>("/admin/signup", credentials, {
    params: { token },
  });

  return response.data;
};

export const refreshToken = async (): Promise<any> => {
  const response = await api.get<any>("/admin/refresh");
  return response.data;
};

export const verifyToken = async (): Promise<User> => {
  const response = await api.get<User>("/admin/verify");
  return response.data;
};

export const verifyInvviteToken = async (token: string) => {
  console.log("token", token);
  const response = await api.get("/admin/verify-invite", {
    params: { token },
  });
  return response.data;
};

export const logout = async (): Promise<void> => {
  await api.post("/logout");
};
