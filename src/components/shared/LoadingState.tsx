interface LoadingStateProps {
  label?: string;
}

export default function LoadingState({
  label = "Đang tải dữ liệu...",
}: LoadingStateProps) {
  return (
    <div
      className="flex min-h-32 items-center justify-center gap-2 text-sm text-text-muted"
      role="status"
    >
      <i className="fas fa-spinner fa-spin" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
