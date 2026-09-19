interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({
  message = "Không thể tải dữ liệu. Vui lòng thử lại.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center px-4 text-center">
      <i
        className="fas fa-circle-exclamation mb-3 text-3xl text-red-400"
        aria-hidden="true"
      />
      <p className="text-sm text-text-muted">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-lg bg-blue-primary px-4 py-2 text-sm font-semibold text-white hover:bg-[#154ea0]"
        >
          Thử lại
        </button>
      )}
    </div>
  );
}
