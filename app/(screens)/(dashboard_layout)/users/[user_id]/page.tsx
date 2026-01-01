import React from "react";
import UserDetails from "./usersDetails";

const page = async ({ params }: { params: Promise<{ user_id: string }> }) => {
  const { user_id } = await params;
  return <UserDetails user_id={user_id} />;
};

export default page;
