import DOMPurify from "isomorphic-dompurify";

const allowedTags = [
  "p", "br", "h2", "h3", "h4", "strong", "b", "em", "i", "u", "s", "blockquote",
  "ul", "ol", "li", "a", "img", "figure", "figcaption", "pre", "code", "hr",
  "table", "thead", "tbody", "tr", "th", "td",
];

const escapeHtml = (value: string) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const plainTextToHtml = (value: string) => value
  .split(/\n{2,}/)
  .map((paragraph) => `<p>${escapeHtml(paragraph).replaceAll("\n", "<br>")}</p>`)
  .join("");

export const sanitizeProductDescription = (value?: string | null) => {
  const description = value?.trim();
  if (!description) return "";
  const html = /<\/?[a-z][\s\S]*>/i.test(description) ? description : plainTextToHtml(description);

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: ["href", "src", "alt", "title", "width", "height", "colspan", "rowspan"],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ["style", "script", "iframe", "object", "embed", "form", "input", "button"],
    FORBID_ATTR: ["style", "class", "id"],
  });
};

export const productDescriptionToText = (value?: string | null) => {
  const contentWithBlockSpacing = (value ?? "").replace(
    /<\/?(?:p|h[1-6]|li|blockquote|pre|tr|div|section|article|br)\b[^>]*>/gi,
    " ",
  );

  return DOMPurify.sanitize(contentWithBlockSpacing, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  }).replace(/\s+/g, " ").trim();
};
