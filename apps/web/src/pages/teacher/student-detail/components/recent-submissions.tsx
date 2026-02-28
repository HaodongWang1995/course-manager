import { useTranslation } from "react-i18next";
import { Card, Badge } from "@course-manager/ui";
import { FileText, FlaskConical, BookOpen } from "lucide-react";

const MOCK_SUBMISSIONS = [
  {
    id: "1",
    title: "Calculus Quiz #4: Limits & Continuity",
    course: "Advanced Mathematics",
    teacher: "Dr. Smith",
    time: "2h",
    status: "graded" as const,
    score: "95/100",
    icon: "math",
  },
  {
    id: "2",
    title: "Physics Lab Report: Newton's Second Law",
    course: "Physics Fundamentals",
    teacher: "Prof. Evans",
    time: "yesterday",
    status: "pending" as const,
    score: null,
    icon: "science",
  },
  {
    id: "3",
    title: "World History Essay: Industrial Revolution",
    course: "World History",
    teacher: "Ms. Thompson",
    time: "Feb 20, 2026",
    status: "graded" as const,
    score: "88/100",
    icon: "history",
  },
];

const ICON_MAP = {
  math: FileText,
  science: FlaskConical,
  history: BookOpen,
};

function StatusBadge({ status, score }: { status: string; score: string | null }) {
  const { t } = useTranslation("studentDetail");

  if (status === "graded" && score) {
    return (
      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
        {t("submissions.graded")}: {score}
      </Badge>
    );
  }
  if (status === "pending") {
    return (
      <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
        {t("submissions.pendingReview")}
      </Badge>
    );
  }
  return (
    <Badge variant="secondary">
      {t("submissions.archived")}
    </Badge>
  );
}

export function RecentSubmissions() {
  const { t } = useTranslation("studentDetail");

  return (
    <Card className="p-5 lg:p-8">
      <h3 className="text-lg font-semibold text-slate-900 lg:text-xl">
        {t("submissions.title")}
      </h3>

      {/* H5: Timeline style */}
      <div className="mt-5 lg:hidden">
        <div className="relative border-l-2 border-slate-200 pl-6">
          {MOCK_SUBMISSIONS.map((sub) => (
            <div key={sub.id} className="relative pb-6 last:pb-0">
              <div className="absolute -left-[25px] top-1 h-3 w-3 rounded-full border-2 border-blue-600 bg-white" />
              <p className="text-sm font-medium text-slate-900">{sub.title}</p>
              <p className="mt-0.5 text-xs text-slate-500">
                {t("submissions.submitted")} {sub.time}
              </p>
              <div className="mt-2">
                <StatusBadge status={sub.status} score={sub.score} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PC: Detailed cards */}
      <div className="mt-5 hidden space-y-4 lg:block">
        {MOCK_SUBMISSIONS.map((sub) => {
          const Icon = ICON_MAP[sub.icon as keyof typeof ICON_MAP] || FileText;
          return (
            <div
              key={sub.id}
              className="flex gap-4 rounded-lg border border-slate-100 p-4"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-900">{sub.title}</p>
                  <span className="text-xs text-slate-400">{sub.time}</span>
                </div>
                <p className="mt-0.5 text-sm text-slate-500">
                  {sub.course} &bull; {t("submissions.teacher")}: {sub.teacher}
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <StatusBadge status={sub.status} score={sub.score} />
                  {sub.status === "graded" && (
                    <button className="text-xs font-medium text-blue-600 hover:text-blue-800">
                      {t("submissions.viewDetails")}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
