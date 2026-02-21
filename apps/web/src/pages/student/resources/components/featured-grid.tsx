import { FileText, FolderOpen, Video, Presentation, FileSpreadsheet, Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Resource } from "@/api/client";

const typeIcons: Record<string, typeof FileText> = {
  pdf: FileText,
  doc: FileSpreadsheet,
  ppt: Presentation,
  video: Video,
  image: FolderOpen,
};

const categoryGradients: Record<string, string> = {
  math: "from-blue-500 to-indigo-600",
  science: "from-emerald-500 to-teal-600",
  literature: "from-purple-500 to-violet-600",
  history: "from-amber-500 to-orange-600",
  default: "from-slate-400 to-slate-600",
};

function getCoverGradient(course: string) {
  const c = (course || "").toLowerCase();
  if (c.includes("math") || c.includes("calculus") || c.includes("alg")) return categoryGradients.math;
  if (c.includes("science") || c.includes("physics") || c.includes("chem") || c.includes("bio")) return categoryGradients.science;
  if (c.includes("lit") || c.includes("english") || c.includes("writing")) return categoryGradients.literature;
  if (c.includes("hist") || c.includes("social")) return categoryGradients.history;
  return categoryGradients.default;
}

interface FeaturedGridProps {
  items: Resource[];
}

export function FeaturedGrid({ items }: FeaturedGridProps) {
  const { t } = useTranslation("studentResources");

  if (items.length === 0) return null;

  return (
    <section>
      <h2 className="mb-4 text-lg font-bold text-slate-900">{t("recentFeatured")}</h2>
      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => {
          const Icon = typeIcons[item.file_type || ""] || FileText;
          const gradient = getCoverGradient(item.course_title || "");
          return (
            <article
              key={item.id}
              className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
            >
              {/* Cover thumbnail */}
              <div className={`relative flex h-24 items-center justify-center bg-gradient-to-br ${gradient}`}>
                <Icon className="h-8 w-8 text-white/80" />
                {item.file_type && (
                  <span className="absolute right-2 top-2 rounded-full bg-white/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
                    {item.file_type}
                  </span>
                )}
              </div>
              {/* Card body */}
              <div className="p-3">
                <h3 className="line-clamp-2 text-xs font-bold leading-4 text-slate-900">{item.title}</h3>
                <p className="mt-1 text-[10px] leading-[15px] text-slate-400">
                  {item.course_title}{item.file_size ? ` · ${item.file_size}` : ""}
                </p>
                <button
                  type="button"
                  className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-[#137fec] hover:underline"
                  aria-label={`Download ${item.title}`}
                >
                  <Download className="h-3 w-3" />
                  {t("download")}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
