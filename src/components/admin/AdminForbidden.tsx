import Link from "next/link";

export default function AdminForbidden() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f8f9] px-4">
      <div className="w-full max-w-md border-l-4 border-red-600 bg-white p-6">
        <p className="text-sm font-bold text-red-700">403 · Không có quyền truy cập</p>
        <h1 className="mt-2 text-xl font-bold text-[#172b35]">Khu vực quản trị</h1>
        <p className="mt-2 text-sm text-[#52636c]">Tài khoản của bạn không được cấp quyền xem nội dung này.</p>
        <Link href="/user" className="mt-5 inline-flex font-semibold text-[#126c6a] hover:underline">Về tài khoản</Link>
      </div>
    </main>
  );
}
