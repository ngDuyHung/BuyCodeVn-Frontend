import Link from "next/link";
import ProductImage from "./ProductImage";
import { formatCurrency } from "@/lib/format";
import { getSafeExternalUrl } from "@/lib/product-media";
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
  variant?: "default" | "featured";
}

export default function ProductCard({ product, variant = "default" }: ProductCardProps) {
  const detailUrl = `/source-code/${product.slug}`;
  const demoUrl = getSafeExternalUrl(product.demo_url);

  if (variant === "featured") {
    return (
      <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-lg border border-[#dfe7e9] bg-white shadow-[0_4px_18px_rgba(18,47,58,.08)] transition duration-300 hover:-translate-y-1 hover:border-[#a9ceca] hover:shadow-[0_16px_36px_rgba(18,47,58,.14)] focus-within:border-[#5da6a1]">
        <Link href={detailUrl} className="relative block aspect-[16/10] overflow-hidden bg-[#edf2f3]">
          <ProductImage thumbnailUrl={product.thumbnail_url} alt={product.title} className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded bg-white/95 px-2.5 py-1 text-[11px] font-bold text-[#174452] shadow-sm backdrop-blur-sm">
            <i className="fas fa-code text-[10px] text-[#14827d]" aria-hidden="true" />{typeLabels[product.type]}
          </span>
        </Link>
        <div className="flex flex-1 flex-col p-4 sm:p-5">
          {product.category?.name && <p className="mb-2 truncate text-xs font-semibold text-[#14827d]">{product.category.name}</p>}
          <h3 className="line-clamp-2 min-h-12 text-base font-bold leading-6 text-[#183642]"><Link href={detailUrl} className="transition-colors hover:text-[#116966] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#116966]">{product.title}</Link></h3>
          <div className="mt-4 flex items-end justify-between gap-3 border-t border-[#e8edef] pt-4">
            <div className="min-w-0"><span className="block text-[11px] font-semibold uppercase text-[#7b8d94]">Giá sản phẩm</span><strong className="mt-0.5 block truncate text-lg text-[#d85d2a]">{formatCurrency(product.price)}</strong></div>
            <div className="flex shrink-0 items-center gap-2">
              {demoUrl && <a href={demoUrl} target="_blank" rel="noopener noreferrer" title="Xem bản demo" aria-label={`Xem demo ${product.title}`} className="flex size-10 items-center justify-center rounded-md border border-[#cbd8da] text-[#46616a] transition hover:border-[#116966] hover:bg-[#eef7f6] hover:text-[#116966] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#116966]"><i className="fas fa-arrow-up-right-from-square text-xs" aria-hidden="true" /></a>}
              <Link href={detailUrl} aria-label={`Xem chi tiết ${product.title}`} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#116966] px-3.5 text-sm font-bold text-white transition hover:bg-[#0d5957] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#116966]">Chi tiết<i className="fas fa-arrow-right text-[10px]" aria-hidden="true" /></Link>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-lg border border-[#dfe7e9] bg-white shadow-[0_3px_14px_rgba(18,47,58,.06)] transition duration-300 hover:-translate-y-1 hover:border-[#a9ceca] hover:shadow-[0_12px_28px_rgba(18,47,58,.12)]">
      <Link
        href={detailUrl}
        className="relative block aspect-[16/10] overflow-hidden bg-[#edf2f3]"
      >
        <ProductImage
          thumbnailUrl={product.thumbnail_url}
          alt={product.title}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded bg-white/95 px-2 py-1 text-[10px] font-bold text-[#174452] shadow-sm"><i className="fas fa-code text-[9px] text-[#14827d]" aria-hidden="true" />{typeLabels[product.type]}</span>
      </Link>
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        {product.category?.name && <p className="mb-1.5 truncate text-[11px] font-semibold text-[#14827d]">{product.category.name}</p>}
        <h2 className="line-clamp-2 min-h-10 text-sm font-bold leading-5 text-[#183642] sm:text-[15px]">
          <Link href={detailUrl} className="transition-colors hover:text-[#116966]">
            {product.title}
          </Link>
        </h2>
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#e8edef] pt-3">
          <strong className="min-w-0 truncate text-sm text-[#d85d2a] sm:text-base">
            {formatCurrency(product.price)}
          </strong>
          <Link
            href={detailUrl}
            className="flex size-9 shrink-0 items-center justify-center rounded-md bg-[#116966] text-white transition-colors hover:bg-[#0d5957] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#116966]"
            aria-label={`Xem chi tiết ${product.title}`}
          >
            <i className="fas fa-arrow-right text-xs" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
