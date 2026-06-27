export type BookingStatus =
  | "created"
  | "store_assigned"
  | "driver_assigned"
  | "driver_arrived"
  | "picked_up"
  | "at_store"
  | "stored"
  | "return_requested"
  | "return_driver_assigned"
  | "out_for_return"
  | "arrived_for_delivery"
  | "delivered"
  | "cancelled"
  | "driver_cancelled_critical";

export interface PopulatedUser {
  _id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
}

export interface PopulatedStore {
  _id: string;
  store_name: string;
  store_contact_number?: string;
}

export interface DriverAssignment {
  driverId?: string | { _id: string; first_name?: string; last_name?: string };
  assignedAt?: string;
  acceptedAt?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface Luggage {
  small: number;
  medium: number;
  large: number;
  other: number;
  totalCount: number;
}

export interface TimelineEntry {
  status: string;
  note?: string;
  updatedBy?: string;
  role?: string;
  createdAt?: string;
}

export interface Booking {
  _id: string;
  bookingCode: string;
  userId: PopulatedUser | string;
  storeId?: PopulatedStore | string;
  serviceAreaId?: string;
  status: BookingStatus;
  luggage?: Luggage;
  luggagePhotos?: {
    pickup?: string[];
    store?: string[];
    delivery?: string[];
  };
  notes?: string;
  pickupLocation?: {
    lat: number;
    lng: number;
    address: string;
  };
  deliveryLocation?: {
    lat: number;
    lng: number;
    address: string;
  } | null;
  pickup?: {
    scheduledAt?: string;
    assignment?: DriverAssignment;
  };
  storage?: {
    storedAt?: string;
    expectedDurationHours?: number;
    releasedAt?: string;
  };
  delivery?: {
    requestedAt?: string;
    scheduledAt?: string;
    assignment?: DriverAssignment;
  };
  pricing?: {
    perHourRate?: number;
    storageHours?: number;
    distanceCharge?: number;
    totalAmount?: number;
    currency?: string;
  };
  payment?: {
    status?: "pending" | "paid" | "failed" | "refunded";
    paidAt?: string;
    transactionId?: string;
  };
  timeline?: TimelineEntry[];
  createdAt: string;
  updatedAt?: string;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

export interface BookingResponse {
  bookings: Booking[];
  pagination: Pagination;
}
