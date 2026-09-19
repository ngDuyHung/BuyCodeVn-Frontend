import Link from "next/link";
import EmptyState from "@/components/shared/EmptyState";

export default function ProductNotFound() {
  return (
    <div className="mx-auto min-h-[60vh] max-w-[900px] px-4 py-12">
      <EmptyState
        title="Không tìm thấy sản phẩm"
        description="Sản phẩm không tồn tại, đã ngừng bán hoặc đường dẫn không còn hợp lệ."
        action={
          <Link href="/source-code" className="font-semibold text-blue-primary">
            Quay lại kho mã nguồn
          </Link>
        }
      />
    </div>
  );
}
