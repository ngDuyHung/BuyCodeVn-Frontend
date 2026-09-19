import type { Metadata } from "next";
import SourceCodeCatalog from "@/components/client/catalog/SourceCodeCatalog";
import { parseCatalogQuery } from "@/lib/catalog-query";
import type { CatalogSearchParams } from "@/types/catalog";

export const metadata: Metadata = {
  title: "Kho mã nguồn & Template | BUYCODE.VN",
  description:
    "Khám phá mã nguồn, template, script và plugin tại BUYCODE.VN.",
};

interface SourceCodePageProps {
  searchParams: Promise<CatalogSearchParams>;
}

export default async function SourceCodePage({
  searchParams,
}: SourceCodePageProps) {
  const initialParams = parseCatalogQuery(await searchParams);
  return <SourceCodeCatalog initialParams={initialParams} />;
}
