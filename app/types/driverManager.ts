export type UserRole = "super_admin" | "admin" | "operation_manager" | "customer_support" | "store_owner" | "driver" | "store" | "user";
export type UserStatus = "active" | "pending" | "blocked" | "inactive";
export type Gender = "male" | "female" | "other";

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
  account_status: string;
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

export interface FilterState {
  search: string;
  account_status: UserStatus | "";
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
  account_status: string;
  role: string;
  is_online: boolean;
  documents: string[];
  currentLocation: {
    lat: number;
    lng: number;
    address: string;
  };
}

export interface DriverUpdateProps {
  driver: Driver;
  onSubmit: (data: Driver) => void;
  onCancel: () => void;
  isLoading?: boolean;
}
