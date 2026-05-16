export interface Address {
  _id?: string;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  coordinates?: number[];
  is_serviceable?: boolean;
  is_default?: boolean;
}

export interface User {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  gender: string;
  dob: string;
  status: string;
  last_login_at: Date;
  is_serviceable: boolean;
  createdAt: Date;
  updatedAt: Date;
  addresses?: Address[];
  phone: string;
  is_active: boolean;
  last_active_at: Date;
  isVerified: boolean;
}

export interface UserUpdateData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  gender: string;
  dob: string;
  addresses?: Address[];
}

export interface UpdateUserStatusData {
  status: string;
  reason: string;
  is_active: boolean;
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
