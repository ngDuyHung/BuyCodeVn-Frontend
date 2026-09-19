"use client";

import ErrorState from "@/components/shared/ErrorState";

export default function ProductDetailError({ reset }: { reset: () => void }) {
  return (
    <div className="mx-auto min-h-[60vh] max-w-[900px] px-4 py-12">
      <ErrorState
        message="Không thể tải thông tin sản phẩm lúc này."
        onRetry={reset}
      />
    </div>
  );
}
