import { sanitizeProductDescription } from "@/lib/product-description";

export default function ProductDescription({ description }: { description?: string | null }) {
  const html = sanitizeProductDescription(description);

  return <section aria-labelledby="product-description-title" className="mt-10 border-t border-[#dce3e5] pt-9 sm:mt-12 sm:pt-11">
    <div className="max-w-4xl">
      <p className="text-xs font-bold uppercase text-[#14827d]">Nội dung sản phẩm</p>
      <h2 id="product-description-title" className="mt-2 text-2xl font-extrabold text-[#183642]">Thông tin chi tiết</h2>
      {html ? <div className="product-rich-content mt-6" dangerouslySetInnerHTML={{ __html: html }} /> : <p className="mt-5 text-sm text-[#64757c]">Sản phẩm hiện chưa có mô tả chi tiết.</p>}
    </div>
  </section>;
}
