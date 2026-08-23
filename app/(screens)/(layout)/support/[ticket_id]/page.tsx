import TicketDetailsClient from "./ticketDetails";

export default async function TicketDetailsPage({ params }: { params: Promise<{ ticket_id: string }> }) {
  const { ticket_id } = await params;
  return <TicketDetailsClient ticketId={ticket_id} />;
}
