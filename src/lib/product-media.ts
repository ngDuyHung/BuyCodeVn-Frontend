export const PRODUCT_IMAGE_FALLBACK = "/images/demo_product.png";

export const getSafeExternalUrl = (value?: string | null) => {
  if (!value) return null;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
};

export const getProductImageUrl = (value?: string | null) =>
  getSafeExternalUrl(value) ?? PRODUCT_IMAGE_FALLBACK;
