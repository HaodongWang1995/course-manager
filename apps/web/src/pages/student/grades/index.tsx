import {
  ArrowLeft,
  Calculator,
  CheckCircle2,
  ChevronRight,
  FlaskConical,
  Filter,
  GraduationCap,
  ScrollText,
  Trophy,
} from "lucide-react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import { useTranslation } from "react-i18next";
import { useStudentGrades } from "@/hooks/use-queries";

const courseIcons = [
  { icon: Calculator, colorClass: "text-orange-600", bgClass: "bg-orange-100" },
  { icon: FlaskConical, colorClass: "text-emerald-600", bgClass: "bg-emerald-100" },
  { icon: ScrollText, colorClass: "text-indigo-600", bgClass: "bg-indigo-100" },
];

const kpiConfig = [
  { key: "gpa" as const, translationKey: "kpi.gpa", icon: GraduationCap, iconColorClass: "text-[#137fec]", iconBgClass: "bg-blue-50" },
  { key: "rank" as const, translationKey: "kpi.classRank", icon: Trophy, iconColorClass: "text-purple-500", iconBgClass: "bg-slate-50" },
  { key: "completion" as const, translationKey: "kpi.completion", icon: CheckCircle2, iconColorClass: "text-emerald-600", iconBgClass: "bg-blue-50" },
];

export function StudentGradesPage() {
  const { t } = useTranslation("studentGrades");
  const { data: grades, isLoading } = useStudentGrades();

  if (isLoading || !grades) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">{t("loading")}</div>
      </div>
    );
  }

  return (
    <div className="-mx-4 min-h-full bg-[#eff6ff] pb-24 md:-mx-6 lg:mx-0 lg:min-h-[calc(100vh-5.5rem)] lg:pb-6">
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
            <h1 className="text-lg font-bold tracking-[-0.45px] text-slate-900">{t("title")}</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-full p-2 text-[#137fec] transition-colors hover:bg-[#137fec]/10"
              aria-label={t("openFilters")}
            >
              <Filter className="h-5 w-5" />
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 bg-slate-200 text-[10px] font-semibold text-slate-600">
              SW
            </div>
          </div>
        </div>

        <div className="mt-2 flex w-full items-center gap-2 text-xs">
          <span className="font-medium text-slate-500">{t("showing")}</span>
          <span className="rounded-full bg-[#137fec]/10 px-2 py-0.5 font-medium text-[#137fec]">{t("filter.semester")}</span>
          <span className="rounded-full bg-[#137fec]/10 px-2 py-0.5 font-medium text-[#137fec]">{t("filter.fullYear")}</span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[448px] flex-col gap-6 px-4 py-4 md:px-0">
        <section className="grid grid-cols-3 gap-3">
          {kpiConfig.map((kpi) => {
            const Icon = kpi.icon;
            const value = grades[kpi.key];
            return (
              <article
                key={kpi.translationKey}
                className="flex min-h-[126px] flex-col items-center justify-center rounded-xl border border-slate-100 bg-white p-[13px] shadow-sm"
              >
                <div className={`mb-1 flex h-10 w-10 items-center justify-center rounded-full ${kpi.iconBgClass}`}>
                  <Icon className={`h-5 w-5 ${kpi.iconColorClass}`} />
                </div>
                <p className="text-2xl font-bold leading-8 text-slate-900">{value}</p>
                <p className="text-xs font-medium text-slate-500">{t(kpi.translationKey)}</p>
              </article>
            );
          })}
        </section>

        <section className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-bold leading-6 text-slate-900">{t("chart.title")}</h2>
              <p className="text-xs leading-4 text-slate-500">{t("chart.vsAverage")}</p>
            </div>
            <div className="mt-1 flex items-center gap-3 text-[10px] font-medium text-slate-600">
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-[#137fec]" />
                {t("chart.you")}
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-slate-300" />
                {t("chart.avg")}
              </span>
            </div>
          </div>

          <div className="mt-4 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={grades.chartData} margin={{ top: 8, right: 16, bottom: 8, left: 16 }}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fontSize: 10, fill: "#64748b", fontWeight: 500 }}
                />
                <Radar
                  name="Avg"
                  dataKey="avg"
                  stroke="#cbd5e1"
                  fill="#cbd5e1"
                  fillOpacity={0.3}
                />
                <Radar
                  name="You"
                  dataKey="you"
                  stroke="#137fec"
                  fill="#137fec"
                  fillOpacity={0.25}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold leading-7 text-slate-900">{t("courses")}</h2>
            <span className="text-sm font-medium text-[#137fec]">
              {grades.courses.length} {t("coursesCount")}
            </span>
          </div>

          <div className="space-y-3">
            {grades.courses.map((course, idx) => {
              const iconCfg = courseIcons[idx % courseIcons.length];
              const Icon = iconCfg.icon;
              return (
                <article
                  key={course.name}
                  className="rounded-xl border border-slate-100 bg-white p-[17px] shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-lg ${iconCfg.bgClass}`}>
                        <Icon className={`h-5 w-5 ${iconCfg.colorClass}`} />
                      </div>
                      <div>
                        <h3 className="text-base font-bold leading-5 text-slate-900">{course.name}</h3>
                        <p className="text-xs leading-4 text-slate-500">{t("teacher")} {course.teacher}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-bold leading-7 text-[#137fec]">{course.overall}%</p>
                      <p className="text-[10px] font-medium uppercase leading-4 text-slate-400">{t("overall")}</p>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="rounded-lg border border-slate-100 bg-slate-50 p-[9px] text-center">
                      <p className="text-xs text-slate-500">{t("midterm")}</p>
                      <p className="text-base font-bold leading-6 text-slate-800">{course.midterm}</p>
                    </div>
                    <div className="rounded-lg border border-slate-100 bg-slate-50 p-[9px] text-center">
                      <p className="text-xs text-slate-500">{t("final")}</p>
                      <p className="text-base font-bold leading-6 text-slate-800">{course.final}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[#137fec]/10 pb-2 pt-3 text-sm font-semibold text-[#137fec] transition-colors hover:bg-[#137fec]/15 active:bg-[#137fec]/20"
                  >
                    {t("viewBreakdown")}
                    <ChevronRight className="h-4 w-4" />
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
