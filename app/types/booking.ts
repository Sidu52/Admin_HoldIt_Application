export interface Booking {
  id: string;
  bookingId: string;
  userName: string;
  userEmail: string;
  userAvatar: string;
  status: "completed" | "in-progress" | "pending" | "cancelled";
  bookingTime: string;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface BookingResponse {
  bookings: Booking[];
  pagination: Pagination;
}
