import { useTranslation } from "react-i18next";
import { Card, Button } from "@course-manager/ui";
import type { TeacherStudentDetail } from "@/api/client";

interface EnrolledCoursesProps {
  enrollments: TeacherStudentDetail["enrollments"];
}

const MOCK_PROGRESS = [96, 92, 100, 88];

export function EnrolledCourses({ enrollments }: EnrolledCoursesProps) {
  const { t } = useTranslation("studentDetail");

  return (
    <Card className="p-5 lg:p-8">
      <h3 className="text-lg font-semibold text-slate-900 lg:text-xl">
        {t("courses.title")}
      </h3>

      <div className="mt-5 space-y-5">
        {enrollments.length === 0 ? (
          <p className="py-4 text-center text-sm text-slate-400">{t("courses.empty")}</p>
        ) : (
          enrollments.map((e, i) => {
            const progress = MOCK_PROGRESS[i % MOCK_PROGRESS.length];
            return (
              <div key={e.enrollment_id} className="space-y-2">
                {/* H5: icon + name + progress bar + grade */}
                <div className="flex items-center gap-3 lg:hidden">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                    <span className="text-sm font-bold">{e.course_title[0]}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{e.course_title}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-blue-600"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-700">{progress}%</span>
                    </div>
                  </div>
                  <span className="text-xs text-blue-600">{t("courses.gradePrefix")}{["A-", "B+", "A", "B"][i % 4]}</span>
                </div>

                {/* PC: name + attendance + progress bar */}
                <div className="hidden lg:block">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{e.course_title}</p>
                      <p className="text-xs text-slate-500">
                        {t("courses.attendancePrefix")}{progress}%
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {enrollments.length > 0 && (
        <Button
          variant="outline"
          className="mt-5 hidden w-full lg:flex"
          onClick={() => alert(t("comingSoon"))}
        >
          {t("courses.viewAll")}
        </Button>
      )}
    </Card>
  );
}
