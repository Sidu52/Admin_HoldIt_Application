import DriverDetailPage from "./driverDetails";

const page = async ({ params }: { params: Promise<{ driver_id: string }> }) => {
  const { driver_id } = await params;
  return <DriverDetailPage driver_id={driver_id} />;
};

export default page;
