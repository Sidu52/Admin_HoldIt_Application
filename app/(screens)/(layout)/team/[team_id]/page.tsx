"use client";
import TeamDetailClient from "./teamDetails";

const page = async ({ params }: { params: Promise<{ team_id: string }> }) => {
  const { team_id } = await params;
  return <TeamDetailClient team_id={team_id} />;
};

export default page;
