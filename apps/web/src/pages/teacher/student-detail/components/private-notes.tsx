import { useTranslation } from "react-i18next";
import { Card } from "@course-manager/ui";
import { Plus } from "lucide-react";

const MOCK_NOTES = [
  {
    id: "1",
    category: "behavioral",
    date: "2026-02-24",
    content:
      "Shows great enthusiasm in group projects but seems to struggle with individual focus during afternoon sessions. Recommend suggesting extra reading.",
  },
  {
    id: "2",
    category: "parentMeeting",
    date: "2026-02-12",
    content:
      "Met with parents. They mentioned taking extra music lessons. Discussed balancing extracurriculars with homework.",
  },
];

export function PrivateNotes() {
  const { t } = useTranslation("studentDetail");

  return (
    <Card className="p-5 lg:p-8">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 lg:text-xl">
          {t("notes.title")}
        </h3>
        <button
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800"
          onClick={() => alert(t("comingSoon"))}
        >
          <Plus className="h-4 w-4" />
          {t("notes.addNew")}
        </button>
      </div>

      <div className="mt-4 space-y-4">
        {MOCK_NOTES.map((note) => (
          <div
            key={note.id}
            className="rounded-lg border border-slate-100 bg-slate-50/50 p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {t(`notes.categories.${note.category}`)}
              </span>
              <span className="text-xs text-slate-400">
                {new Date(note.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              &ldquo;{note.content}&rdquo;
            </p>
          </div>
        ))}
      </div>

      <button
        className="mt-4 hidden w-full text-center text-sm font-medium text-blue-600 hover:text-blue-800 lg:block"
        onClick={() => alert(t("comingSoon"))}
      >
        {t("notes.showHistory", { count: 12 })}
      </button>
    </Card>
  );
}
