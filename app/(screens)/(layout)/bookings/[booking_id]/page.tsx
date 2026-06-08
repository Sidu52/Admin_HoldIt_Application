import BookingDetailsClient from "./bookingDetails";

export default function BookingDetailsPage({ params }: { params: { booking_id: string } }) {
  return <BookingDetailsClient bookingId={params.booking_id} />;
}
