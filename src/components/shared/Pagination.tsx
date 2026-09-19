interface PaginationProps {
  currentPage: number;
  lastPage: number;
  onPageChange: (page: number) => void;
}

type PageItem = number | "ellipsis-start" | "ellipsis-end";

export const getPaginationItems = (
  currentPage: number,
  lastPage: number,
): PageItem[] => {
  if (lastPage <= 7) {
    return Array.from({ length: lastPage }, (_, index) => index + 1);
  }

  const pages = new Set([1, lastPage, currentPage - 1, currentPage, currentPage + 1]);
  const visiblePages = [...pages]
    .filter((page) => page >= 1 && page <= lastPage)
    .sort((a, b) => a - b);
  const items: PageItem[] = [];

  visiblePages.forEach((page, index) => {
    const previous = visiblePages[index - 1];
    if (previous && page - previous > 1) {
      items.push(previous === 1 ? "ellipsis-start" : "ellipsis-end");
    }
    items.push(page);
  });

  return items;
};

export default function Pagination({
  currentPage,
  lastPage,
  onPageChange,
}: PaginationProps) {
  if (lastPage <= 1) return null;

  const items = getPaginationItems(currentPage, lastPage);

  return (
    <nav className="flex items-center justify-center gap-2" aria-label="Phân trang">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="h-9 w-9 rounded border border-gray-border disabled:opacity-40"
        aria-label="Trang trước"
      >
        <i className="fas fa-chevron-left text-xs" aria-hidden="true" />
      </button>
      {items.map((item) =>
        typeof item === "number" ? (
          <button
            type="button"
            key={item}
            onClick={() => onPageChange(item)}
            aria-current={item === currentPage ? "page" : undefined}
            className={`h-9 min-w-9 rounded px-2 text-sm font-semibold ${
              item === currentPage
                ? "bg-blue-primary text-white"
                : "border border-gray-border text-gray-600 hover:bg-gray-50"
            }`}
          >
            {item}
          </button>
        ) : (
          <span key={item} className="px-1 text-text-muted" aria-hidden="true">
            ...
          </span>
        ),
      )}
      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= lastPage}
        className="h-9 w-9 rounded border border-gray-border disabled:opacity-40"
        aria-label="Trang sau"
      >
        <i className="fas fa-chevron-right text-xs" aria-hidden="true" />
      </button>
    </nav>
  );
}
