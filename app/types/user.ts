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
  type?: "Home" | "Office" | "Other";
}

export interface User {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  gender: string;
  date_of_birth: string;
  account_status: string;
  is_serviceable: boolean;
  phone: string;
  verification_status: string;
  createdAt: Date;
  updatedAt: Date;
  addresses?: Address[];
  last_login_at: Date;
  last_active_at: Date;
}

export interface UserUpdateData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  gender: string;
  date_of_birth: string;
  addresses?: Address[];
  verification_status: string;
}

export interface UpdateUserStatusData {
  account_status: string;
  reason: string;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface FilterState {
  search: string;
  account_status: string;
}

export interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
