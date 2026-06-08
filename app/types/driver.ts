export type UserRole = "super_admin" | "admin" | "operation_manager" | "customer_support" | "store_owner" | "driver" | "store" | "user";
export type UserStatus = "active" | "pending" | "blocked" | "inactive";
export type Gender = "male" | "female" | "other";

// app/types/driver.ts
export interface Driver {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  gender: string;
  date_of_birth: string;
  address: string;
  is_online: boolean;
  is_on_trip: boolean;
  last_active_at: Date;
  is_signup: boolean;
  vehicle_type: string;
  license_number: string;
  verification_status: string;
  account_status: string;
  is_serviceable: boolean;
  currentLocation: {
    coordinates: [number, number]
    address: string;
    updatedAt: Date;
  }
  createdAt: Date;
  updatedAt: Date;
  phone: string;
  last_login_at: Date;
  account_deactivated_reason: string;
}

export interface DriverUpdateData {
  first_name: string;
  last_name: string;
  email: string;
  gender: string;
  date_of_birth: string;
  address: string;
  phone: string;
  vehicle_type: string;
  license_number: string;
  verification_status: string;
  documents: string[];
}

export interface UpdateDriverStatusData {
  account_status: string;
  account_deactivated_reason: string;
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
  is_online: boolean | null;
}

export interface DriversResponse {
  drivers: Driver[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}