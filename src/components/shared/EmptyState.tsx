import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function EmptyState({
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center px-4 text-center">
      <i
        className="fas fa-inbox mb-3 text-3xl text-gray-300"
        aria-hidden="true"
      />
      <h3 className="text-base font-bold text-blue-nav">{title}</h3>
      {description && (
        <p className="mt-1 max-w-md text-sm text-text-muted">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
