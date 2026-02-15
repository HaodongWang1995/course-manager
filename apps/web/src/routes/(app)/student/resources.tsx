import { createFileRoute } from "@tanstack/react-router";
import {
  CloudUpload,
  FileText,
  FolderOpen,
  Menu,
  MoreHorizontal,
  Video,
  Presentation,
  FileSpreadsheet,
} from "lucide-react";
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

function StudentResources() {
  const { data: resources, isLoading } = useStudentResources();

  if (isLoading || !resources) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="relative -mx-4 min-h-full overflow-x-hidden bg-[#eff6ff] pb-24 md:-mx-6 lg:mx-0 lg:min-h-[calc(100vh-5.5rem)] lg:pb-6">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-4 pb-[13px] pt-3 backdrop-blur-md md:px-6 lg:px-8">
        <div className="flex h-10 w-full items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-bold tracking-[-0.45px] text-[#137fec]">Resource Hub</h1>
          </div>

          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 bg-slate-200 text-[10px] font-semibold text-slate-600">
            TS
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[448px] flex-col gap-6 px-4 py-4 md:px-0">
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

        {resources.featured.length > 0 && (
          <section>
            <h2 className="mb-4 text-lg font-bold text-slate-900">Featured Resources</h2>
            <div className="space-y-3">
              {resources.featured.map((item) => {
                const Icon = typeIcons[item.type] || FileText;
                return (
                  <article
                    key={item.title}
                    className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-[17px] shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#eff6ff]">
                        <Icon className="h-5 w-5 text-[#137fec]" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold leading-5 text-slate-900">{item.title}</h3>
                        <p className="text-[10px] leading-[15px] text-slate-400">{item.course} &middot; {item.meta}</p>
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

        <section>
          <h2 className="mb-4 text-lg font-bold text-slate-900">All Resources</h2>
          <div className="space-y-3">
            {resources.all.map((item) => {
              const Icon = typeIcons[item.type] || FileText;
              return (
                <article
                  key={item.title}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-[17px] shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50">
                      <Icon className="h-5 w-5 text-[#137fec]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold leading-5 text-slate-900">{item.title}</h3>
                      <p className="text-[10px] leading-[15px] text-slate-400">{item.meta}</p>
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
      </main>
    </div>
  );
}
