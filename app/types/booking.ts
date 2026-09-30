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
  otp?: string;
  returnOtp?: string;
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
  criticalHandoverLocation?: {
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
  reviews?: BookingReview[];
  isReviewed?: boolean;
  createdAt: string;
  couponCode?: string | null;
  coupon?: {
    couponId?: string;
    code?: string;
    discountType?: "PERCENTAGE" | "FIXED";
    discountValue?: number;
    discountAmount?: number;
    advanceDiscount?: number;
    finalDiscount?: number;
    remainingDiscount?: number;
    appliedAt?: string;
    appliedBy?: string;
    appliedByModel?: "Admin" | "User";
    removedAt?: string | null;
  } | null;
  [key: string]: any;
}

export interface BookingReview {
  _id: string;
  bookingId: string;
  userId?: {
    _id?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    email?: string;
    avatar?: string;
  };
  driverId?: {
    _id?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    profile_picture?: string;
  };
  storeId?: {
    _id?: string;
    store_name?: string;
    address?: string;
    location?: any;
  };
  reviewType: "DRIVER" | "STORE" | "PLATFORM" | "SERVICE";
  rating: number;
  tags?: string[];
  comment?: string;
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
