const statusLabels: Record<string, string> = {
  processing: "Đang xử lý",
  completed: "Hoàn thành",
  failed: "Thất bại",
  pending: "Đang chờ",
  active: "Đang hoạt động",
  suspended: "Tạm ngưng",
  expired: "Hết hạn",
  terminated: "Đã chấm dứt",
  cancelled: "Đã hủy",
  rejected: "Đã từ chối",
};

export const formatCurrency = (value: number | string) =>
  formatMoney(value);

export const formatDate = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(date);
};

export const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

export const getStatusLabel = (status: string) => statusLabels[status] ?? status;
import { formatMoney } from "./money";
