import { useState, useMemo } from "react";
import { CloudUpload, FolderOpen, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useStudentResources } from "@/hooks/use-queries";
import { FeaturedGrid } from "./components/featured-grid";
import { ResourceList } from "./components/resource-list";
import { CategoryFilter } from "./components/category-filter";

function matchesCategory(course: string, category: string) {
  if (category === "All") return true;
  return (course || "").toLowerCase().includes(category.toLowerCase());
}

export function StudentResourcesPage() {
  const { t } = useTranslation("studentResources");
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
        <div className="text-gray-500">{t("loading")}</div>
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
            <h1 className="text-lg font-bold tracking-[-0.45px] text-[#137fec]">{t("title")}</h1>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 bg-slate-200 text-[10px] font-semibold text-slate-600">
            TS
          </div>
        </div>

        {/* 11.2: Category tabs */}
        <CategoryFilter activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
      </header>

      <main className="mx-auto flex w-full max-w-[448px] flex-col gap-6 px-4 py-4 md:px-0">
        {/* Stats */}
        <section className="grid grid-cols-2 gap-3">
          <article className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#eff6ff] text-[#137fec]">
              <FolderOpen className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold leading-8 text-slate-900">
              {resources.all.length + resources.featured.length}
            </p>
            <p className="text-xs text-slate-500">{t("totalResources")}</p>
          </article>
          <article className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-emerald-500">
              <CloudUpload className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold leading-8 text-slate-900">{resources.featured.length}</p>
            <p className="text-xs text-slate-500">{t("featured")}</p>
          </article>
        </section>

        {/* 11.3: Recent & Featured — thumbnail card grid */}
        <FeaturedGrid items={filteredFeatured} />

        {/* All Resources list */}
        <ResourceList items={filteredAll} />

        {filteredFeatured.length === 0 && filteredAll.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FolderOpen className="mb-3 h-10 w-10 text-slate-300" />
            <p className="text-sm font-medium text-slate-500">{t("empty")}</p>
          </div>
        )}
      </main>
    </div>
  );
}
