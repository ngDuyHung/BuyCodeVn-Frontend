"use client";

import { useState } from "react";
import {
  getProductImageUrl,
  PRODUCT_IMAGE_FALLBACK,
} from "@/lib/product-media";

interface ProductImageProps {
  alt: string;
  className?: string;
  priority?: boolean;
  thumbnailUrl?: string | null;
}

export default function ProductImage({
  alt,
  className,
  priority = false,
  thumbnailUrl,
}: ProductImageProps) {
  const imageUrl = getProductImageUrl(thumbnailUrl);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const src = failedUrl === imageUrl ? PRODUCT_IMAGE_FALLBACK : imageUrl;

  return (
    // The API accepts arbitrary HTTPS hosts, so Next Image cannot preconfigure them.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      onError={() => setFailedUrl(imageUrl)}
      className={className}
    />
  );
}
