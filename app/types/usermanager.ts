// app/types/user.ts
export interface User {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  avatar: string;
  role: "admin" | "manager" | "user" | "support";
  status: "active" | "inactive" | "suspended" | "pending";
  email_verified: boolean;
  phone_verified: boolean;
  last_login: Date;
  login_count: number;
  created_at: Date;
  updated_at: Date;
  permissions?: string[];
  department?: string;
  job_title?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    zip_code: string;
  };
  preferences?: {
    language: string;
    timezone: string;
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
}

export interface UserUpdateData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  department?: string;
  job_title?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    zip_code: string;
  };
  permissions?: string[];
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface FilterState {
  search: string;
  status: string;
  role: string;
  department: string;
}

export interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}