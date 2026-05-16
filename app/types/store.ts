
export interface Store {
    _id: string;
    store_name: string;
    store_address: string;
    store_open_time: string;
    store_close_time: string;
    store_description: string;
    store_contact_number: string;
    location: {
        type: string;
        coordinates: number[];
        address: string;
    };
    service_area_id: string;
    is_online: boolean;
    verification_status: string;
    status: string;
    current_booking_count: number;
    max_booking_capacity: number;
    rating: number;
    last_active_at: Date;
    // Relation to StoreOwner
    store_owner_id: string;
}

export interface StoreUpdateData {
    store_name: string;
    store_address: string;
    store_open_time: string;
    store_close_time: string;
    store_description: string;
    store_contact_number: string;
    location: {
        type: string;
        coordinates: number[];
        address: string;
    };
}

export interface UpdateStoreStatusData {
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

export interface StoresResponse {
    stores: Store[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}       