import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, Badge } from "@course-manager/ui";
import { Star, MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useMyFeedbacks } from "@/hooks/use-queries";
import { enrollmentApi, type Enrollment } from "@/api/client";
import { useQuery } from "@tanstack/react-query";
import { studentKeys } from "@/lib/query-keys";

export const Route = createFileRoute("/(app)/student/lesson-feedback")({
  component: StudentLessonFeedbackPage,
});

function StudentLessonFeedbackPage() {
  const { t } = useTranslation();
  const [courseFilter, setCourseFilter] = useState<string>("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useMyFeedbacks({
    course_id: courseFilter || undefined,
    page,
  });

  // Get enrolled courses for filter dropdown
  const { data: enrollments } = useQuery({
    queryKey: studentKeys.enrollments({ status: "approved" }).queryKey,
    queryFn: () => enrollmentApi.listMine({ status: "approved" }),
  });

  const courses = enrollments
    ? [...new Map(enrollments.map((e: Enrollment) => [e.course_id, { id: e.course_id, title: e.course_title || e.course_id }])).values()]
    : [];

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">
          {t("studentLessonFeedback.title")}
        </h1>
      </div>

      {/* Course Filter */}
      <div>
        <select
          className="rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          value={courseFilter}
          onChange={(e) => {
            setCourseFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">{t("studentLessonFeedback.allCourses")}</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
      </div>

      {/* Feedback List */}
      {isLoading ? (
        <div className="text-center text-slate-400 py-8">Loading...</div>
      ) : !data?.data?.length ? (
        <Card className="p-8 text-center">
          <MessageSquare className="mx-auto mb-3 h-12 w-12 text-slate-300" />
          <p className="text-slate-500">{t("studentLessonFeedback.noFeedback")}</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {data.data.map((fb) => (
            <Card key={fb.id} className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-slate-900">{fb.course_title}</span>
                  <span className="mx-2 text-slate-300">·</span>
                  <span className="text-sm text-slate-500">
                    第{fb.lesson_number}课
                  </span>
                  <span className="mx-2 text-slate-300">·</span>
                  <span className="text-sm text-slate-500">
                    {new Date(fb.lesson_date).toLocaleDateString("zh-CN")}
                  </span>
                </div>
                <Badge variant="default">{t("studentLessonFeedback.statusPublished")}</Badge>
              </div>

              <p className="text-xs text-slate-400">
                {fb.teacher_name}
              </p>

              {fb.rating && (
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className={`h-4 w-4 ${n <= fb.rating! ? "fill-yellow-400 text-yellow-400" : "text-slate-200"}`}
                    />
                  ))}
                </div>
              )}

              {fb.comment && (
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">{t("studentLessonFeedback.comment")}</p>
                  <p className="text-sm text-slate-700">{fb.comment}</p>
                </div>
              )}

              {fb.suggestion && (
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">{t("studentLessonFeedback.suggestion")}</p>
                  <p className="text-sm text-slate-700">{fb.suggestion}</p>
                </div>
              )}
            </Card>
          ))}

          {/* Pagination */}
          {data.total > data.limit && (
            <div className="flex justify-center gap-2 pt-4">
              <button
                className="rounded px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 disabled:text-slate-300"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                上一页
              </button>
              <span className="px-3 py-1 text-sm text-slate-500">
                {page} / {Math.ceil(data.total / data.limit)}
              </span>
              <button
                className="rounded px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 disabled:text-slate-300"
                disabled={page >= Math.ceil(data.total / data.limit)}
                onClick={() => setPage((p) => p + 1)}
              >
                下一页
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
