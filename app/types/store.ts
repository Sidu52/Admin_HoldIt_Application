import { StoreOwner } from "./storeOwner";

export interface Store {
    _id: string;
    phone: string
    store_name: string;
    store_open_time: string;
    store_close_time: string;
    store_description: string;
    store_contact_number: string;
    store_deactivated_reason: string;
    location: {
        type: string;
        coordinates: number[];
        address: string;
    };
    is_online: boolean;
    verification_status: string;
    account_status: string;
    current_booking_count: number;
    max_booking_capacity: number;
    rating_avg: number;
    rating_count: number;
    last_active_at: Date;
    store_owner_id: StoreOwner;
    deactivated_at: Date;
    updatedAt: Date;
}

export interface StoreUpdateData {
    store_name: string;
    store_open_time: string;
    store_close_time: string;
    store_description: string;
    store_contact_number: string;
    verification_status: string;
    max_booking_capacity: number;
}

export interface UpdateStoreLocation {
    location: {
        lat: number;
        lng: number;
        address: string;
    }
}

export interface UpdateStoreStatusData {
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

export interface StoresResponse {
    stores: Store[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}       