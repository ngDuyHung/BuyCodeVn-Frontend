import { notFound } from "next/navigation";
import HostingServiceDetail from "@/components/client/services/HostingServiceDetail";

export default async function UserHostingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const serviceId = Number(id);
  if (!Number.isInteger(serviceId) || serviceId < 1) notFound();

  return <HostingServiceDetail serviceId={serviceId} />;
}
