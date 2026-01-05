import React from "react";
import UserDetailPage from "./userDetails";

const page = async ({ params }: { params: Promise<{ user_id: string }> }) => {
  const { user_id } = await params;
  return <UserDetailPage user_id={user_id} />;
};

export default page;
