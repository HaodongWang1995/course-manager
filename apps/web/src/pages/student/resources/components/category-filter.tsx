const CATEGORIES = ["All", "Math", "Science", "Literature", "History"] as const;
export type Category = (typeof CATEGORIES)[number];

interface CategoryFilterProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export function CategoryFilter({ activeCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="mt-2 flex items-center gap-2 overflow-x-auto pb-0.5">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          type="button"
          onClick={() => onCategoryChange(cat)}
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
            activeCategory === cat
              ? "bg-[#137fec] text-white"
              : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
