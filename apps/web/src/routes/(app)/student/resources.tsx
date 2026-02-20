import { createFileRoute } from "@tanstack/react-router";
import {
  CloudUpload,
  FileText,
  FolderOpen,
  ArrowLeft,
  MoreHorizontal,
  Video,
  Presentation,
  FileSpreadsheet,
  Download,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useStudentResources } from "@/hooks/use-queries";

export const Route = createFileRoute("/(app)/student/resources")({
  component: StudentResources,
});

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

const CATEGORIES = ["All", "Math", "Science", "Literature", "History"] as const;

function matchesCategory(course: string, category: string) {
  if (category === "All") return true;
  return (course || "").toLowerCase().includes(category.toLowerCase());
}

function StudentResources() {
  const { data: resources, isLoading } = useStudentResources();
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const filteredFeatured = useMemo(() => {
    if (!resources) return [];
    return resources.featured.filter((item) => matchesCategory(item.course_title || "", activeCategory));
  }, [resources, activeCategory]);

  const filteredAll = useMemo(() => {
    if (!resources) return [];
    return resources.all.filter((item) => matchesCategory(item.course_title || "", activeCategory));
  }, [resources, activeCategory]);

  if (isLoading || !resources) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="relative -mx-4 min-h-full overflow-x-hidden bg-[#eff6ff] pb-24 md:-mx-6 lg:mx-0 lg:min-h-[calc(100vh-5.5rem)] lg:pb-6">
      {/* 11.1: Renamed to "Library" */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-4 pb-[13px] pt-3 backdrop-blur-md md:px-6 lg:px-8">
        <div className="flex h-10 w-full items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-bold tracking-[-0.45px] text-[#137fec]">Library</h1>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 bg-slate-200 text-[10px] font-semibold text-slate-600">
            TS
          </div>
        </div>

        {/* 11.2: Category tabs */}
        <div className="mt-2 flex items-center gap-2 overflow-x-auto pb-0.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
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
      </header>

      <main className="mx-auto flex w-full max-w-[448px] flex-col gap-6 px-4 py-4 md:px-0">
        {/* Stats */}
        <section className="grid grid-cols-2 gap-3">
          <article className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#eff6ff] text-[#137fec]">
              <FolderOpen className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold leading-8 text-slate-900">{resources.all.length + resources.featured.length}</p>
            <p className="text-xs text-slate-500">Total Resources</p>
          </article>
          <article className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-emerald-500">
              <CloudUpload className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold leading-8 text-slate-900">{resources.featured.length}</p>
            <p className="text-xs text-slate-500">Featured</p>
          </article>
        </section>

        {/* 11.3: Recent & Featured — thumbnail card grid */}
        {filteredFeatured.length > 0 && (
          <section>
            <h2 className="mb-4 text-lg font-bold text-slate-900">Recent &amp; Featured</h2>
            <div className="grid grid-cols-2 gap-3">
              {filteredFeatured.map((item) => {
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
                      <p className="mt-1 text-[10px] leading-[15px] text-slate-400">{item.course_title}{item.file_size ? ` · ${item.file_size}` : ""}</p>
                      <button
                        type="button"
                        className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-[#137fec] hover:underline"
                        aria-label={`Download ${item.title}`}
                      >
                        <Download className="h-3 w-3" />
                        Download
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* All Resources list */}
        {filteredAll.length > 0 && (
          <section>
            <h2 className="mb-4 text-lg font-bold text-slate-900">All Resources</h2>
            <div className="space-y-3">
              {filteredAll.map((item) => {
                const Icon = typeIcons[item.file_type || ""] || FileText;
                return (
                  <article
                    key={item.id}
                    className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-[17px] shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50">
                        <Icon className="h-5 w-5 text-[#137fec]" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold leading-5 text-slate-900">{item.title}</h3>
                        <p className="text-[10px] leading-[15px] text-slate-400">{item.file_size}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                      aria-label="Open item actions"
                    >
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {filteredFeatured.length === 0 && filteredAll.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FolderOpen className="mb-3 h-10 w-10 text-slate-300" />
            <p className="text-sm font-medium text-slate-500">No resources in this category</p>
          </div>
        )}
      </main>
    </div>
  );
}
