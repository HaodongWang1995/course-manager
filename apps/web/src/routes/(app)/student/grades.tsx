import { createFileRoute, Link } from "@tanstack/react-router";
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

export const Route = createFileRoute("/(app)/student/grades")({
  component: StudentGrades,
});

type SubjectLabel = "Math" | "Sci" | "Hist" | "Eng" | "Art";

type Kpi = {
  label: string;
  value: string;
  icon: typeof GraduationCap;
  iconColorClass: string;
  iconBgClass: string;
};

type ExamScore = {
  label: string;
  value: string;
};

type CourseGrade = {
  id: string;
  name: string;
  teacher: string;
  overall: string;
  icon: typeof Calculator;
  iconColorClass: string;
  iconBgClass: string;
  midterm: ExamScore;
  final: ExamScore;
};

const kpis: Kpi[] = [
  {
    label: "GPA",
    value: "3.8",
    icon: GraduationCap,
    iconColorClass: "text-[#137fec]",
    iconBgClass: "bg-blue-50",
  },
  {
    label: "Class Rank",
    value: "5th",
    icon: Trophy,
    iconColorClass: "text-purple-500",
    iconBgClass: "bg-slate-50",
  },
  {
    label: "Completion",
    value: "92%",
    icon: CheckCircle2,
    iconColorClass: "text-emerald-600",
    iconBgClass: "bg-blue-50",
  },
];

const subjectLabels: SubjectLabel[] = ["Math", "Sci", "Hist", "Eng", "Art"];

const courses: CourseGrade[] = [
  {
    id: "mathematics-101",
    name: "Mathematics 101",
    teacher: "Mr. Anderson",
    overall: "95%",
    icon: Calculator,
    iconColorClass: "text-orange-600",
    iconBgClass: "bg-orange-100",
    midterm: { label: "Midterm", value: "A (92)" },
    final: { label: "Final", value: "A+ (98)" },
  },
  {
    id: "advanced-physics",
    name: "Advanced Physics",
    teacher: "Ms. Roberts",
    overall: "88%",
    icon: FlaskConical,
    iconColorClass: "text-emerald-600",
    iconBgClass: "bg-emerald-100",
    midterm: { label: "Midterm", value: "B+ (89)" },
    final: { label: "Final", value: "B (87)" },
  },
  {
    id: "world-history",
    name: "World History",
    teacher: "Mr. Lewis",
    overall: "92%",
    icon: ScrollText,
    iconColorClass: "text-indigo-600",
    iconBgClass: "bg-indigo-100",
    midterm: { label: "Midterm", value: "A- (91)" },
    final: { label: "Final", value: "A (93)" },
  },
];

function StudentGrades() {
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
            <h1 className="text-lg font-bold tracking-[-0.45px] text-slate-900">Gradebook</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-full p-2 text-[#137fec] transition-colors hover:bg-[#137fec]/10"
              aria-label="Open filters"
            >
              <Filter className="h-5 w-5" />
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 bg-slate-200 text-[10px] font-semibold text-slate-600">
              SW
            </div>
          </div>
        </div>

        <div className="mt-2 flex w-full items-center gap-2 text-xs">
          <span className="font-medium text-slate-500">Showing:</span>
          <span className="rounded-full bg-[#137fec]/10 px-2 py-0.5 font-medium text-[#137fec]">Fall 2023</span>
          <span className="rounded-full bg-[#137fec]/10 px-2 py-0.5 font-medium text-[#137fec]">Full Year</span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[448px] flex-col gap-6 px-4 py-4 md:px-0">
        <section className="grid grid-cols-3 gap-3">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <article
                key={kpi.label}
                className="flex min-h-[126px] flex-col items-center justify-center rounded-xl border border-slate-100 bg-white p-[13px] shadow-sm"
              >
                <div className={`mb-1 flex h-10 w-10 items-center justify-center rounded-full ${kpi.iconBgClass}`}>
                  <Icon className={`h-5 w-5 ${kpi.iconColorClass}`} />
                </div>
                <p className="text-2xl font-bold leading-8 text-slate-900">{kpi.value}</p>
                <p className="text-xs font-medium text-slate-500">{kpi.label}</p>
              </article>
            );
          })}
        </section>

        <section className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-bold leading-6 text-slate-900">Performance Overview</h2>
              <p className="text-xs leading-4 text-slate-500">Vs. Class Average</p>
            </div>
            <div className="mt-1 flex items-center gap-3 text-[10px] font-medium text-slate-600">
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-[#137fec]" />
                You
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-slate-300" />
                Avg
              </span>
            </div>
          </div>

          <div className="mt-6 h-48">
            <div className="relative h-[192px] rounded-b-md">
              <div className="absolute inset-0 grid grid-rows-5">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="border-b border-slate-100" />
                ))}
              </div>
              <div className="absolute inset-x-0 bottom-0 grid grid-cols-5 px-2 pb-1">
                {subjectLabels.map((subject) => (
                  <span key={subject} className="text-center text-[10px] font-medium uppercase text-slate-500">
                    {subject}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold leading-7 text-slate-900">Courses</h2>
            <Link
              to="/student/courses/$courseId"
              params={{ courseId: "mathematics-101" }}
              className="text-sm font-medium text-[#137fec] transition-colors hover:text-[#0f6ecf]"
            >
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {courses.map((course) => {
              const Icon = course.icon;
              return (
                <article
                  key={course.id}
                  className="rounded-xl border border-slate-100 bg-white p-[17px] shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-lg ${course.iconBgClass}`}>
                        <Icon className={`h-5 w-5 ${course.iconColorClass}`} />
                      </div>
                      <div>
                        <h3 className="text-base font-bold leading-5 text-slate-900">{course.name}</h3>
                        <p className="text-xs leading-4 text-slate-500">Teacher: {course.teacher}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-bold leading-7 text-[#137fec]">{course.overall}</p>
                      <p className="text-[10px] font-medium uppercase leading-4 text-slate-400">Overall</p>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="rounded-lg border border-slate-100 bg-slate-50 p-[9px] text-center">
                      <p className="text-xs text-slate-500">{course.midterm.label}</p>
                      <p className="text-base font-bold leading-6 text-slate-800">{course.midterm.value}</p>
                    </div>
                    <div className="rounded-lg border border-slate-100 bg-slate-50 p-[9px] text-center">
                      <p className="text-xs text-slate-500">{course.final.label}</p>
                      <p className="text-base font-bold leading-6 text-slate-800">{course.final.value}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[#137fec]/10 pb-2 pt-3 text-sm font-semibold text-[#137fec] transition-colors hover:bg-[#137fec]/15 active:bg-[#137fec]/20"
                  >
                    View Breakdown
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
