import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductImage from "@/components/client/catalog/ProductImage";
import ProductPurchasePanel from "@/components/client/catalog/ProductPurchasePanel";
import { formatCurrency } from "@/lib/format";
import { getSafeExternalUrl } from "@/lib/product-media";
import { getPublicProduct } from "@/services/server/catalogService";

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

const typeLabels = {
  source_code: "Mã nguồn",
  template: "Template",
  script: "Script",
  plugin: "Plugin",
  other: "Khác",
} as const;

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const product = await getPublicProduct(slug);
    if (!product) return { title: "Không tìm thấy sản phẩm | BUYCODE.VN" };

    return {
      title: `${product.title} | BUYCODE.VN`,
      description:
        product.description?.slice(0, 160) ||
        `Xem chi tiết ${product.title} tại BUYCODE.VN.`,
    };
  } catch {
    return { title: "Chi tiết mã nguồn | BUYCODE.VN" };
  }
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getPublicProduct(slug);
  if (!product) notFound();
  const demoUrl = getSafeExternalUrl(product.demo_url);

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8 md:py-12">
      <div className="mx-auto max-w-[1180px] px-4 md:px-5">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-[13px] text-text-muted" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-blue-primary">Trang chủ</Link>
          <i className="fas fa-chevron-right text-[10px] text-gray-300" aria-hidden="true" />
          <Link href="/source-code" className="hover:text-blue-primary">Mã nguồn</Link>
          <i className="fas fa-chevron-right text-[10px] text-gray-300" aria-hidden="true" />
          <span className="max-w-[280px] truncate font-semibold text-blue-nav">{product.title}</span>
        </nav>

        <article className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,.85fr)] lg:gap-12">
          <div className="relative aspect-[16/10] overflow-hidden rounded-lg border border-gray-border bg-white">
            <ProductImage
              thumbnailUrl={product.thumbnail_url}
              alt={product.title}
              priority
              className="size-full object-cover"
            />
          </div>

          <div className="flex flex-col justify-center">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded bg-[#e0f2fe] px-2.5 py-1 text-xs font-semibold text-[#0369a1]">
                {typeLabels[product.type]}
              </span>
              {product.category && (
                <span className="rounded bg-gray-100 px-2.5 py-1 text-xs font-semibold text-[#475569]">
                  {product.category.name}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-extrabold leading-tight text-blue-nav md:text-3xl">
              {product.title}
            </h1>
            <p className="mt-5 text-3xl font-extrabold text-blue-primary">
              {formatCurrency(product.price)}
            </p>
            <p className="mt-5 whitespace-pre-line text-[15px] leading-7 text-[#475569]">
              {product.description || "Sản phẩm hiện chưa có mô tả chi tiết."}
            </p>
            <ProductPurchasePanel product={product} />
            <div className="mt-4 flex flex-wrap gap-3">
              {demoUrl && (
                <a
                  href={demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 items-center gap-2 text-sm font-bold text-blue-primary hover:text-[#154ea0]"
                >
                  <i className="fas fa-up-right-from-square text-xs" aria-hidden="true" />
                  Xem bản demo
                </a>
              )}
              <Link
                href="/source-code"
                className="inline-flex h-10 items-center gap-2 text-sm font-bold text-blue-primary hover:text-[#154ea0]"
              >
                <i className="fas fa-arrow-left text-xs" aria-hidden="true" />
                Khám phá thêm sản phẩm
              </Link>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
