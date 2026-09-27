import { getStatusLabel } from "@/lib/format";
import type { UserServiceStatus } from "@/types/services";

const statusStyles: Record<UserServiceStatus, string> = {
  active: "bg-green-50 text-green-700",
  pending: "bg-amber-50 text-amber-700",
  suspended: "bg-orange-50 text-orange-700",
  expired: "bg-gray-100 text-gray-600",
  failed: "bg-red-50 text-red-700",
  terminated: "bg-gray-100 text-gray-600",
};

export default function ServiceStatusBadge({ status }: { status: UserServiceStatus }) {
  return (
    <span className={`rounded px-2 py-1 text-xs font-semibold ${statusStyles[status]}`}>
      {getStatusLabel(status)}
    </span>
  );
}
