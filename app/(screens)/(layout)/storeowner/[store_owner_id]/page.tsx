import StoreOwnerDetail from "./storeOwnerDetail";

const page = async ({ params }: { params: Promise<{ store_owner_id: string }> }) => {
  const { store_owner_id } = await params;
  return <StoreOwnerDetail store_owner_id={store_owner_id} />;
};

export default page;
