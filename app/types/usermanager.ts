export type UserRole = "admin" | "editor" | "viewer";
export type UserStatus = "active" | "pending" | "blocked" | "inactive";
export type Gender = "male" | "female" | "other";

export interface User {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  gender: string;
  dob: string;
  address: string;

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

export interface FilterState {
  search: string;
  status: UserStatus | "";
}

export interface UserUpdateData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  gender: Gender;
  dob: string;
  address: string;
  status: UserStatus;
  role: UserRole;
}

export interface UserUpdateProps {
  user: User;
  onSubmit: (data: User) => void;
  onCancel: () => void;
  isLoading?: boolean;
}
