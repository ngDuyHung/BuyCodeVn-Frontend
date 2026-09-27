import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center bg-[#f8fafc] px-4 py-16">
      <div className="max-w-md text-center">
        <p className="text-sm font-extrabold text-orange-main">404</p>
        <h1 className="mt-2 text-2xl font-extrabold text-blue-nav">Không tìm thấy trang</h1>
        <p className="mt-2 text-sm text-text-muted">Đường dẫn có thể đã thay đổi hoặc nội dung không còn tồn tại.</p>
        <Link href="/" className="mt-6 inline-flex rounded-md bg-blue-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-[#154ea0]">Về trang chủ</Link>
      </div>
    </main>
  );
}
