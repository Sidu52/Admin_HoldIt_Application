import AreaFormClient from "./AreaForm";

export default async function AreaDetailsPage({ params }: { params: Promise<{ area_id: string }> }) {
  const { area_id } = await params;
  return <AreaFormClient areaId={area_id} />;
}
