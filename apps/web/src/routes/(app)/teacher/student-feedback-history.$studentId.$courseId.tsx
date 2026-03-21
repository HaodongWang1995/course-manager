import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, Button, Badge } from "@course-manager/ui";
import { ArrowLeft, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useStudentFeedbackHistory } from "@/hooks/use-queries";

export const Route = createFileRoute("/(app)/teacher/student-feedback-history/$studentId/$courseId")({
  component: TeacherFeedbackHistoryPage,
});

function TeacherFeedbackHistoryPage() {
  const { studentId, courseId } = Route.useParams();
  const { t } = useTranslation();
  const { data, isLoading } = useStudentFeedbackHistory(studentId, courseId);

  if (isLoading) {
    return <div className="flex items-center justify-center p-8 text-slate-400">Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 lg:p-6">
      <div className="flex items-center gap-3">
        <Link to="/teacher/courses/$courseId" params={{ courseId }}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-lg font-semibold text-slate-900">
          {t("studentLessonFeedback.feedbackHistory")}
        </h1>
      </div>

      {!data?.length ? (
        <Card className="p-8 text-center text-slate-400">
          {t("studentLessonFeedback.noFeedback")}
        </Card>
      ) : (
        <div className="relative border-l-2 border-slate-200 pl-6 space-y-6">
          {data.map((fb) => (
            <div key={fb.id} className="relative">
              <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 border-blue-500 bg-white" />
              <Card className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">
                    第{fb.lesson_number}课 · {new Date(fb.lesson_date).toLocaleDateString("zh-CN")}
                  </span>
                  <Badge variant={fb.status === "published" ? "default" : "secondary"}>
                    {fb.status === "published"
                      ? t("studentLessonFeedback.statusPublished")
                      : t("studentLessonFeedback.statusDraft")}
                  </Badge>
                </div>

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
                  <p className="text-sm text-slate-700">{fb.comment}</p>
                )}

                {fb.suggestion && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">{t("studentLessonFeedback.suggestion")}</p>
                    <p className="text-sm text-slate-600">{fb.suggestion}</p>
                  </div>
                )}
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
