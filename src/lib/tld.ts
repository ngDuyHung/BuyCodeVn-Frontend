export const normalizeTld = (value: string) => {
  const normalized = value.trim().toLowerCase().replace(/^\.+/, "");
  return normalized ? `.${normalized}` : "";
};
