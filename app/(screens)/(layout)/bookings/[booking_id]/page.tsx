import BookingDetailsClient from "./bookingDetails";

const BookingDetailsPage = async ({ params }: { params: Promise<{ booking_id: string }> }) => {
  const { booking_id } = await params;
  return <BookingDetailsClient bookingId={booking_id} />;
};

export default BookingDetailsPage;
