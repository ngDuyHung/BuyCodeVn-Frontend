"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Keep details out of the UI; the digest can be correlated with server logs.
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[60vh] items-center justify-center bg-[#f8fafc] px-4 py-16">
      <div className="max-w-md text-center">
        <i className="fas fa-circle-exclamation text-4xl text-red-500" aria-hidden="true" />
        <h1 className="mt-4 text-2xl font-extrabold text-blue-nav">Không thể hiển thị trang</h1>
        <p className="mt-2 text-sm text-text-muted">Đã có lỗi ngoài dự kiến. Bạn có thể thử tải lại phần nội dung này.</p>
        {error.digest && <p className="mt-2 text-xs text-text-muted">Mã tham chiếu: {error.digest}</p>}
        <button type="button" onClick={reset} className="mt-6 rounded-md bg-blue-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-[#154ea0]">Thử lại</button>
      </div>
    </main>
  );
}
