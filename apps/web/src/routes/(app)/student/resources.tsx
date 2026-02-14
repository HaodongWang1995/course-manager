import { createFileRoute } from "@tanstack/react-router";
import {
  ChevronDown,
  CloudUpload,
  FileText,
  FolderOpen,
  Menu,
  MoreHorizontal,
  Upload,
  X,
} from "lucide-react";

export const Route = createFileRoute("/(app)/student/resources")({
  component: StudentResources,
});

type UploadItem = {
  id: string;
  title: string;
  subtitle: string;
  icon: typeof FileText;
  iconBg: string;
};

const uploads: UploadItem[] = [
  {
    id: "syllabus",
    title: "Syllabus_2024.pdf",
    subtitle: "Shared with Mathematics 101",
    icon: FileText,
    iconBg: "bg-[#eff6ff]",
  },
  {
    id: "lecture",
    title: "Lecture_01_Rec.mp4",
    subtitle: "Shared with Physics 202",
    icon: FolderOpen,
    iconBg: "bg-slate-50",
  },
];

function StudentResources() {
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
            <p className="text-2xl font-bold leading-8 text-slate-900">42</p>
            <p className="text-xs text-slate-500">Total Resources</p>
          </article>
          <article className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-emerald-500">
              <CloudUpload className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold leading-8 text-slate-900">12.4GB</p>
            <p className="text-xs text-slate-500">Storage Used</p>
          </article>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-bold text-slate-900">Recent Uploads</h2>
          <div className="space-y-3">
            {uploads.map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-[17px] shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.iconBg}`}>
                      <Icon className="h-5 w-5 text-[#137fec]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold leading-5 text-slate-900">{item.title}</h3>
                      <p className="text-[10px] leading-[15px] text-slate-400">{item.subtitle}</p>
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

      <div className="fixed inset-0 z-20 bg-slate-900/60 backdrop-blur-[1px]" />

      <div className="pointer-events-none fixed inset-0 z-30 grid place-items-center px-4 py-6">
        <section className="pointer-events-auto w-full max-w-[384px] overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200">
          <header className="flex items-start justify-between border-b border-slate-100 px-5 pb-[21px] pt-5">
            <div>
              <h2 className="text-lg font-bold leading-[22.5px] text-slate-900">Resource Upload</h2>
              <p className="text-xs text-slate-500">Add new course materials</p>
            </div>
            <button
              type="button"
              className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              aria-label="Close upload dialog"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          <div className="max-h-[70vh] overflow-y-auto px-5 py-5">
            <div className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.6px] text-slate-500">Resource Title</span>
                <input
                  type="text"
                  placeholder="e.g. Calculus Introduction Slides"
                  className="h-[46px] w-full rounded-xl border border-slate-100 bg-slate-50 px-4 text-sm text-slate-900 placeholder:text-slate-400"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.6px] text-slate-500">Module / Course</span>
                <button
                  type="button"
                  className="flex h-[46px] w-full items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 text-sm text-slate-900"
                >
                  <span>Mathematics 101 - Calculus</span>
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                </button>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.6px] text-slate-500">Description</span>
                <textarea
                  rows={2}
                  placeholder="Briefly describe the contents of this resource..."
                  className="w-full resize-none rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400"
                />
              </label>

              <div>
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.6px] text-slate-500">Upload Files</span>
                <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
                  <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#137fec]/10 text-[#137fec]">
                    <Upload className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700">Drag &amp; drop files here</p>
                  <p className="mb-4 text-xs text-slate-400">Max file size: 50MB</p>
                  <button
                    type="button"
                    className="rounded-full border border-slate-200 bg-white px-5 py-2 text-xs font-bold text-slate-700 shadow-sm"
                  >
                    Browse Files
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-[13px]">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <p className="truncate text-xs font-bold text-slate-700">Calculus_Notes_v2.pdf</p>
                    <p className="text-[10px] font-bold text-[#137fec]">75%</p>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100">
                    <div className="h-1.5 w-3/4 rounded-full bg-[#137fec]" />
                  </div>
                </div>
                <button
                  type="button"
                  className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                  aria-label="Cancel upload"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <footer className="grid grid-cols-2 gap-3 border-t border-slate-100 bg-slate-50/50 px-5 pb-5 pt-[21px]">
            <button
              type="button"
              className="rounded-2xl bg-slate-200 px-4 py-3 text-sm font-bold text-slate-700"
            >
              Cancel
            </button>
            <button
              type="button"
              className="rounded-2xl bg-[#137fec] px-4 py-3 text-sm font-bold text-white shadow-[0px_10px_15px_-3px_rgba(19,127,236,0.25),0px_4px_6px_-4px_rgba(19,127,236,0.25)]"
            >
              Upload
            </button>
          </footer>
        </section>
      </div>
    </div>
  );
}
