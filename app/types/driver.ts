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
  last_active_at: Date;
  isSignUp: boolean;
  vehicleType: string;
  licenseNumber: string;
  verification_status: string;
  status: string;
  is_serviceable: boolean;
  createdAt: Date;
  updatedAt: Date;
  phone: string;
  last_login_at: Date;
  isVerified: boolean;
}

export interface DriverUpdateData {
  first_name: string;
  last_name: string;
  email: string;
  gender: string;
  date_of_birth: string;
  address: string;
  phone: string;
  licenseNumber: string;
  vehicleType: string;
  verification_status: string;
  is_online: boolean;
  documents: string[];
  currentLocation: {
    lat: number;
    lng: number;
    address: string;
  };
}

export interface UpdateDriverStatusData {
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
  is_online: boolean | null;
}

export interface DriversResponse {
  drivers: Driver[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}