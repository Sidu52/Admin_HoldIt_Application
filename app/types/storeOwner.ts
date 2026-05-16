
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
    status: string;
    createdAt: Date;
    updatedAt: Date;
    update_by: string;
    onboarding_status: string;
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

export interface StoreOwnersResponse {
    storeOwners: StoreOwner[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}