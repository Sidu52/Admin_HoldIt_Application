import StoreDetail from "./storeDetail";

const page = async ({ params }: { params: Promise<{ store_id: string }> }) => {
  const { store_id } = await params;
  return <StoreDetail store_id={store_id} />;
};

export default page;
