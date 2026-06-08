export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupPayload {
  credentials: SignupCredentials;
}


export interface SignupCredentials {
  invite_token: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  address: string;
  date_of_birth: string;
  password: string;
  confirm_password: string;
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
