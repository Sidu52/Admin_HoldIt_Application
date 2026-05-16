export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupPayload {
  token: string;
  credentials: SignupCredentials;
}


export interface SignupCredentials {
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  password: string;
  confirmPassword: string;
  gender: string;
}

export interface AuthResponse {
  data: {
    user: User;
  };
  message: string;
  status: string;
}

export interface RefreshTokenResponse {
  message: string;
  status: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}
