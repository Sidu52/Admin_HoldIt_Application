export type UserRole = "admin" | "editor" | "viewer";
export type UserStatus = "active" | "pending" | "blocked" | "inactive";
export type Gender = "male" | "female" | "other";

// app/types/driver.ts
export interface Driver {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  gender: string;
  dob: string;
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
  auth_user_id: {
    role: string;
    phone: number;
    last_login_at: Date;
    isVerified: boolean;
  };
}

export interface DriverUpdateData {
  first_name: string;
  last_name: string;
  email: string;
  gender: string;
  dob: string;
  address: string;
  phone: string;
  licenseNumber: string;
  vehicleType: string;
  verification_status: string;
  status: string;
  role: string;
  is_online: boolean;
  documents: string[];
  currentLocation: {
    lat: number;
    lng: number;
    address: string;
  };
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
  vehicleType: string;
  is_online: boolean | null;
}

export interface DriversResponse {
  drivers: Driver[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}