import { Store } from "./store";

export interface StoreOwner {
    _id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    gender: string;
    date_of_birth: string;
    address: string;
    last_login_at: Date;
    last_active_at: Date;
    account_status: string;
    account_deactivated_reason: string;
    verification_status: string;
    createdAt: Date;
    updatedAt: Date;
    store_count: number;
    activeStoreCount: number;
    inactiveStoreCount: number;
    stores: Store[];
}

export interface StoreOwnerUpdateData {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    gender: string;
    date_of_birth: string;
    address: string;
}

export interface UpdateStoreOwnerStatusData {
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
    account_status: string;
}

export interface StoreOwnersResponse {
    storeOwners: StoreOwner[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}