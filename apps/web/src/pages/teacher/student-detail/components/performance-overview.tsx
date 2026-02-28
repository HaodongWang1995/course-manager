import { useTranslation } from "react-i18next";
import { Card } from "@course-manager/ui";

const SKILL_BARS = [
  { key: "attendance", value: 98 },
  { key: "homework", value: 82 },
  { key: "participation", value: 75 },
  { key: "grades", value: 90 },
] as const;

export function PerformanceOverview() {
  const { t } = useTranslation("studentDetail");

  return (
    <Card className="p-5 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 lg:text-xl">
            {t("performance.title")}
          </h3>
          <p className="mt-1 hidden text-sm text-slate-500 lg:block">
            {t("performance.subtitle")}
          </p>
        </div>
        <span className="text-xs font-medium text-blue-600 lg:text-sm">
          {t("performance.semester")}
        </span>
      </div>

      {/* KPI Cards */}
      <div className="mt-5 grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-emerald-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            {t("performance.attendanceLabel")}
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900 lg:text-3xl">98%</p>
          <p className="mt-1 text-xs text-emerald-600">{t("performance.attendanceNote")}</p>
        </div>
        <div className="rounded-lg bg-orange-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            {t("performance.homeworkLabel")}
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900 lg:text-3xl">12/14</p>
          <p className="mt-1 text-xs text-orange-600">{t("performance.homeworkNote")}</p>
        </div>
      </div>

      {/* Skill Bars (H5 only — visible on mobile, hidden on PC) */}
      <div className="mt-5 space-y-3 lg:hidden">
        {SKILL_BARS.map(({ key, value }) => (
          <div key={key} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">{t(`performance.skills.${key}`)}</span>
              <span className="text-sm font-medium text-slate-700">{value}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-blue-600"
                style={{ width: `${value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
