import { createFileRoute, useParams } from "@tanstack/react-router";
import { Card, CardContent, Badge } from "@course-manager/ui";
import {
  ArrowLeft,
  Clock,
  User,
  CheckCircle2,
  MessageSquare,
  BookOpen,
} from "lucide-react";
import { useCourseFeedbackDetail } from "@/hooks/use-queries";

export const Route = createFileRoute("/(app)/student/feedback/$courseId")({
  component: StudentFeedbackDetail,
});

function StudentFeedbackDetail() {
  const { courseId } = useParams({ from: "/student/feedback/$courseId" });
  const { data: feedback, isLoading } = useCourseFeedbackDetail(courseId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-gray-500">Loading feedback...</p>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="mx-auto max-w-lg space-y-5 pb-24">
        <div className="flex items-center gap-3">
          <a
            href="/student"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-gray-600" />
          </a>
          <h1 className="text-lg font-bold text-gray-900">Feedback Detail</h1>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-sm text-gray-500">No feedback available for this course yet.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const requirements = feedback.requirements || [];
  const actions = feedback.actions || [];
  const pendingCount = actions.filter((a) => a.pending).length;

  return (
    <div className="mx-auto max-w-lg space-y-5 pb-24">
      {/* Top Navigation Bar */}
      <div className="flex items-center gap-3">
        <a
          href="/student"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-gray-600" />
        </a>
        <h1 className="text-lg font-bold text-gray-900">Feedback Detail</h1>
      </div>

      {/* Class Header Card */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">
                {feedback.course_title || "Course Feedback"}
              </h2>
              <div className="mt-2 space-y-1.5">
                {feedback.updated_at && (
                  <div className="flex items-center gap-2 text-sm text-blue-100">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{new Date(feedback.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>
                )}
                {feedback.teacher_name && (
                  <div className="flex items-center gap-2 text-sm text-blue-100">
                    <User className="h-3.5 w-3.5" />
                    <span>{feedback.teacher_name}</span>
                  </div>
                )}
              </div>
            </div>
            <Badge className={feedback.published ? "bg-emerald-500/20 text-emerald-100 border-emerald-400/30" : "bg-amber-500/20 text-amber-100 border-amber-400/30"}>
              {feedback.published ? "Published" : "Draft"}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Pre-class Requirements */}
      {requirements.length > 0 && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-blue-900">
                Pre-class Requirements
              </h3>
            </div>
            <div className="space-y-3">
              {requirements.map((req, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                  </div>
                  <span className="text-sm text-gray-700">{req}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Class Summary / Feedback */}
      {(feedback.summary || feedback.quote) && (
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Class Summary
            </h3>
            <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
              {feedback.summary && <p>{feedback.summary}</p>}
              {feedback.quote && (
                <div className="rounded-lg border-l-4 border-blue-400 bg-blue-50 p-3">
                  <p className="text-sm text-blue-800 italic">"{feedback.quote}"</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Items */}
      {actions.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Action Items</h3>
              {pendingCount > 0 && (
                <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">
                  {pendingCount} Pending
                </Badge>
              )}
            </div>
            <div className="space-y-3">
              {actions.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3"
                >
                  <div className="mt-0.5">
                    {item.pending ? (
                      <div className="h-4 w-4 rounded border-2 border-gray-300 bg-white" />
                    ) : (
                      <div className="flex h-4 w-4 items-center justify-center rounded bg-green-500">
                        <CheckCircle2 className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${item.pending ? "text-gray-900" : "text-gray-500 line-through"}`}>{item.title}</p>
                    {item.due_label && (
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-400">
                        <Clock className="h-3 w-3" />
                        <span>Due: {item.due_label}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sticky Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white p-4 lg:hidden">
        <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-blue-700 transition-colors">
          <MessageSquare className="h-4 w-4" />
          Message Teacher
        </button>
      </div>

      {/* Desktop CTA */}
      <div className="hidden lg:block">
        <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors">
          <MessageSquare className="h-4 w-4" />
          Message Teacher
        </button>
      </div>
    </div>
  );
}
