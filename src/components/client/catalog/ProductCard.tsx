import Link from "next/link";
import ProductImage from "./ProductImage";
import { formatCurrency } from "@/lib/format";
import type { Product } from "@/types/catalog";

const typeLabels: Record<Product["type"], string> = {
  source_code: "Mã nguồn",
  template: "Template",
  script: "Script",
  plugin: "Plugin",
  other: "Khác",
};

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-[#edf0f5] bg-white shadow-[0_2px_12px_rgba(0,0,0,.07)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_10px_28px_rgba(0,0,0,.12)]">
      <Link
        href={`/source-code/${product.slug}`}
        className="relative block aspect-[16/9] overflow-hidden bg-[#f0f4f8]"
      >
        <ProductImage
          thumbnailUrl={product.thumbnail_url}
          alt={product.title}
          className="size-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <span className="mb-2 self-start rounded bg-[#e0f2fe] px-2 py-1 text-[10px] font-semibold uppercase text-[#0369a1]">
          {typeLabels[product.type]}
        </span>
        <h2 className="line-clamp-2 text-sm font-bold leading-5 text-blue-nav">
          <Link href={`/source-code/${product.slug}`} className="hover:text-blue-primary">
            {product.title}
          </Link>
        </h2>
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-[#f1f5f9] pt-4">
          <strong className="text-[15px] text-blue-primary">
            {formatCurrency(product.price)}
          </strong>
          <Link
            href={`/source-code/${product.slug}`}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-[#dbeafe] bg-[#f0f6ff] text-blue-primary transition-colors hover:border-blue-primary hover:bg-blue-primary hover:text-white"
            aria-label={`Xem chi tiết ${product.title}`}
          >
            <i className="fas fa-arrow-right text-xs" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
