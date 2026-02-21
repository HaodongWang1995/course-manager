import { FileText, FolderOpen, Video, Presentation, FileSpreadsheet, MoreHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Resource } from "@/api/client";

const typeIcons: Record<string, typeof FileText> = {
  pdf: FileText,
  doc: FileSpreadsheet,
  ppt: Presentation,
  video: Video,
  image: FolderOpen,
};

interface ResourceListProps {
  items: Resource[];
}

export function ResourceList({ items }: ResourceListProps) {
  const { t } = useTranslation("studentResources");

  if (items.length === 0) return null;

  return (
    <section>
      <h2 className="mb-4 text-lg font-bold text-slate-900">{t("allResources")}</h2>
      <div className="space-y-3">
        {items.map((item) => {
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
  );
}
