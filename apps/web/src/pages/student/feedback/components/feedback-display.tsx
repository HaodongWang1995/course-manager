import { Card, CardContent, Badge } from "@course-manager/ui";
import {
  Clock,
  CheckCircle2,
  MessageSquare,
  BookOpen,
  FileText,
  Download,
  FileSpreadsheet,
} from "lucide-react";

interface FeedbackAction {
  id: string;
  title: string;
  pending: boolean;
  due_label?: string;
}

interface FeedbackData {
  course_title?: string;
  due_date?: string;
  updated_at?: string;
  published?: boolean;
  teacher_name?: string;
  requirements?: string[];
  actions?: FeedbackAction[];
  summary?: string;
  quote?: string;
}

interface ResourceItem {
  id: string;
  title: string;
  file_type?: string;
  file_size?: string;
}

function FileIcon({ fileType }: { fileType?: string }) {
  const type = (fileType || "").toLowerCase();
  if (type.includes("pdf")) {
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100">
        <FileText className="h-5 w-5 text-red-600" />
      </div>
    );
  }
  if (type.includes("doc")) {
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100">
        <FileText className="h-5 w-5 text-blue-600" />
      </div>
    );
  }
  if (type.includes("xls") || type.includes("sheet")) {
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-100">
        <FileSpreadsheet className="h-5 w-5 text-green-600" />
      </div>
    );
  }
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
      <FileText className="h-5 w-5 text-gray-500" />
    </div>
  );
}

interface FeedbackDisplayProps {
  feedback: FeedbackData;
  resources: ResourceItem[];
}

export function FeedbackDisplay({ feedback, resources }: FeedbackDisplayProps) {
  const requirements = feedback.requirements || [];
  const actions = feedback.actions || [];
  const pendingCount = actions.filter((a) => a.pending).length;

  const headerDate = feedback.due_date
    ? new Date(feedback.due_date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : feedback.updated_at
    ? new Date(feedback.updated_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  function isUrgentDue(label: string) {
    const l = label.toLowerCase();
    return l.includes("tomorrow") || l.includes("today") || l.includes("hour");
  }

  return (
    <>
      {/* Class Header Card */}
      <Card className="overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-gray-900 leading-snug">
                {feedback.course_title || "Course Feedback"}
              </h2>
              {headerDate && (
                <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                  {headerDate}
                  {feedback.due_date && (
                    <span>
                      ,{" "}
                      {new Date(feedback.due_date).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </span>
                  )}
                </p>
              )}
            </div>
            <Badge
              className={
                feedback.published
                  ? "shrink-0 bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "shrink-0 bg-amber-50 text-amber-700 border-amber-200"
              }
            >
              {feedback.published ? "Completed" : "Draft"}
            </Badge>
          </div>

          {feedback.teacher_name && (
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                {feedback.teacher_name
                  .split(" ")
                  .slice(0, 2)
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{feedback.teacher_name}</p>
                <p className="text-xs text-gray-500">Department</p>
              </div>
            </div>
          )}
        </CardContent>
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
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Class Summary</h3>
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
                    <p
                      className={`text-sm ${item.pending ? "text-gray-900" : "text-gray-500 line-through"}`}
                    >
                      {item.title}
                    </p>
                    {item.due_label && (
                      <div
                        className={`mt-1 flex items-center gap-1.5 text-xs ${
                          item.pending && isUrgentDue(item.due_label)
                            ? "text-red-500"
                            : "text-gray-400"
                        }`}
                      >
                        <Clock className="h-3 w-3 shrink-0" />
                        <span>Due {item.due_label}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resources */}
      {resources.length > 0 && (
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Resources
          </p>
          <Card>
            <CardContent className="divide-y divide-gray-100 p-0">
              {resources.map((resource) => (
                <div
                  key={resource.id}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  <FileIcon fileType={resource.file_type} />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {resource.title}
                    </p>
                    {resource.file_size && (
                      <p className="text-xs text-gray-400">{resource.file_size}</p>
                    )}
                  </div>
                  <button className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
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
    </>
  );
}
