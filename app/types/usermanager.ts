// app/types/user.ts
export interface User {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  gender: string;
  dob: string;
  status: string;
  last_login_at: Date;
  is_active: boolean;
  is_serviceable: boolean;
  createdAt: Date;
  updatedAt: Date;
  address: string;
  auth_user_id?: {
    _id: string;
    phone: string;
    role: string;
    last_login_at: Date;
    last_active_at: Date;
    isVerified: boolean;
  };
}

export interface UserUpdateData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  gender: string;
  dob: string;
  address: string;
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
}

export interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
