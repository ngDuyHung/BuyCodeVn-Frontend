import type { Category } from "@/types/catalog";

interface CategoryTreeProps {
  categories: Category[];
  selectedId?: number | "";
  onSelect: (categoryId: number) => void;
  depth?: number;
}

export default function CategoryTree({
  categories,
  selectedId,
  onSelect,
  depth = 0,
}: CategoryTreeProps) {
  return (
    <ul className={depth === 0 ? "flex flex-col gap-1" : "mt-1 flex flex-col gap-1"}>
      {categories.map((category) => (
        <li key={category.id}>
          <button
            type="button"
            onClick={() => onSelect(category.id)}
            className={`w-full rounded-md py-1.5 pr-2 text-left text-sm transition-colors hover:bg-blue-50 hover:text-blue-primary ${
              selectedId === category.id
                ? "bg-blue-50 font-bold text-blue-primary"
                : "text-[#475569]"
            }`}
            style={{ paddingLeft: `${8 + depth * 16}px` }}
          >
            {category.name}
          </button>
          {category.children?.length > 0 && (
            <CategoryTree
              categories={category.children}
              selectedId={selectedId}
              onSelect={onSelect}
              depth={depth + 1}
            />
          )}
        </li>
      ))}
    </ul>
  );
}
