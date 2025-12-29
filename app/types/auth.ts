export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupPayload {
  token: string;
  credentials: SignupCredentials;
}


export interface SignupCredentials {
  username: string;
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
  data: {
    accessToken: string;
    expiresIn: number;
  };
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
