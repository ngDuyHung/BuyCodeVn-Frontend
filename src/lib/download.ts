const FALLBACK_FILENAME = "source-code.zip";

const sanitizeFilename = (value: string) => {
  const filename = value.replace(/[\\/:*?"<>|]/g, "_").trim();
  return filename || FALLBACK_FILENAME;
};

export const getDownloadFilename = (
  contentDisposition: string | null,
  fallback = FALLBACK_FILENAME,
) => {
  if (!contentDisposition) return sanitizeFilename(fallback);

  const encoded = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  if (encoded) {
    try {
      return sanitizeFilename(decodeURIComponent(encoded));
    } catch {
      return sanitizeFilename(encoded);
    }
  }

  const plain = contentDisposition.match(/filename="?([^";]+)"?/i)?.[1];
  return sanitizeFilename(plain || fallback);
};

export const saveBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = sanitizeFilename(filename);
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};
