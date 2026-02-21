import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@course-manager/ui";
import { Filter } from "lucide-react";

export interface CourseFilter {
  label: string;
  value: string;
  count: number;
}

interface StudentFiltersProps {
  avgAttendance: string;
  courseFilters: CourseFilter[];
  selectedCourse: string;
  onCourseChange: (value: string) => void;
  selectedYear: string;
  onYearChange: (value: string) => void;
  showActiveOnly: boolean;
  onShowActiveOnlyChange: (value: boolean) => void;
  showAtRisk: boolean;
  onShowAtRiskChange: (value: boolean) => void;
}

export function StudentFilters({
  avgAttendance,
  courseFilters,
  selectedCourse,
  onCourseChange,
  selectedYear,
  onYearChange,
  showActiveOnly,
  onShowActiveOnlyChange,
  showAtRisk,
  onShowAtRiskChange,
}: StudentFiltersProps) {
  const { t } = useTranslation("teacherStudents");

  const gradeFilters = [
    { label: t("filters.grades.all"), value: "all" },
    { label: t("filters.grades.freshman"), value: "freshman" },
    { label: t("filters.grades.sophomore"), value: "sophomore" },
    { label: t("filters.grades.junior"), value: "junior" },
    { label: t("filters.grades.senior"), value: "senior" },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Filter className="h-4 w-4" />
          {t("filters.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Avg Attendance — large blue number */}
        <div className="rounded-lg bg-blue-50 px-4 py-3 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-400">{t("filters.avgAttendance")}</p>
          <p className="mt-1 text-3xl font-bold leading-none text-blue-600">{avgAttendance}%</p>
          <p className="mt-1 text-[10px] text-blue-400">{t("filters.acrossAll")}</p>
        </div>

        {/* Enrolled Course Filter */}
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
            {t("filters.enrolledCourse")}
          </h4>
          <div className="space-y-1">
            {courseFilters.map((course) => (
              <button
                key={course.value}
                onClick={() => onCourseChange(course.value)}
                className={`flex w-full items-center justify-between rounded-md px-3 py-1.5 text-sm transition-colors ${
                  selectedCourse === course.value
                    ? "bg-blue-50 font-medium text-blue-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span>{course.label}</span>
                <span className="text-xs text-gray-400">{course.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Grade/Year Filter */}
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
            {t("filters.gradeYear")}
          </h4>
          <div className="space-y-1">
            {gradeFilters.map((grade) => (
              <button
                key={grade.value}
                onClick={() => onYearChange(grade.value)}
                className={`w-full rounded-md px-3 py-1.5 text-left text-sm transition-colors ${
                  selectedYear === grade.value
                    ? "bg-blue-50 font-medium text-blue-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {grade.label}
              </button>
            ))}
          </div>
        </div>

        {/* Status Toggles */}
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
            {t("filters.status")}
          </h4>
          <div className="space-y-2">
            <label className="flex cursor-pointer items-center justify-between rounded-md px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50">
              <span>{t("filters.activeOnly")}</span>
              <input
                type="checkbox"
                checked={showActiveOnly}
                onChange={() => onShowActiveOnlyChange(!showActiveOnly)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </label>
            <label className="flex cursor-pointer items-center justify-between rounded-md px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50">
              <span>{t("filters.atRisk")}</span>
              <input
                type="checkbox"
                checked={showAtRisk}
                onChange={() => onShowAtRiskChange(!showAtRisk)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
