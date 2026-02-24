import { useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@course-manager/ui";
import { BookOpen, Calendar, ChevronDown, ChevronUp, Pencil, Plus, Trash2, Users } from "lucide-react";
import type { Assignment } from "@/api/client";
import { useTranslation } from "react-i18next";
import { useAssignmentSubmissions } from "@/hooks/use-queries";

interface AssignmentSectionProps {
  assignments: Assignment[];
  onDelete: (id: string) => void;
  onRequestAdd: () => void;
  onRequestEdit: (assignment: Assignment) => void;
}

function SubmissionStats({ assignmentId }: { assignmentId: string }) {
  const { t } = useTranslation("teacherCourseDetail");
  const { data: submissions = [] } = useAssignmentSubmissions(assignmentId);

  if (submissions.length === 0) return null;

  const submitted = submissions.filter((s) => s.submission_status === "submitted" || s.submission_status === "late" || s.submission_status === "graded");
  const notSubmitted = submissions.filter((s) => !s.submission_status || s.submission_status === "pending");

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center gap-1.5 text-xs text-gray-500">
        <Users className="h-3 w-3" />
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-help font-medium text-green-600 underline decoration-dotted">
              {submitted.length}
            </span>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-60">
            <p className="mb-1 text-xs font-semibold">{t("submission.submittedStudents")}</p>
            {submitted.length === 0 ? (
              <p className="text-xs text-gray-400">{t("submission.none")}</p>
            ) : (
              <ul className="space-y-0.5">
                {submitted.map((s) => (
                  <li key={s.student_id} className="text-xs">{s.student_name}</li>
                ))}
              </ul>
            )}
          </TooltipContent>
        </Tooltip>
        <span>/</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-help font-medium text-gray-500 underline decoration-dotted">
              {submissions.length}
            </span>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-60">
            <p className="mb-1 text-xs font-semibold">{t("submission.notSubmittedStudents")}</p>
            {notSubmitted.length === 0 ? (
              <p className="text-xs text-gray-400">{t("submission.none")}</p>
            ) : (
              <ul className="space-y-0.5">
                {notSubmitted.map((s) => (
                  <li key={s.student_id} className="text-xs">{s.student_name}</li>
                ))}
              </ul>
            )}
          </TooltipContent>
        </Tooltip>
        <span className="text-gray-400">{t("submission.submitted")}</span>
      </div>
    </TooltipProvider>
  );
}

export function AssignmentSection({
  assignments,
  onDelete,
  onRequestAdd,
  onRequestEdit,
}: AssignmentSectionProps) {
  const { t } = useTranslation("teacherCourseDetail");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-gray-500" />
          <CardTitle>{t("assignment.title")} ({assignments.length})</CardTitle>
        </div>
        <Button size="sm" variant="outline" onClick={onRequestAdd}>
          <Plus className="h-4 w-4 mr-1" /> {t("assignment.addButton")}
        </Button>
      </CardHeader>
      <CardContent>
        {assignments.length === 0 ? (
          <p className="py-4 text-center text-sm text-gray-400">{t("assignment.empty")}</p>
        ) : (
          <div className="space-y-2">
            {assignments.map((a) => {
              const isExpanded = expandedId === a.id;
              return (
                <div
                  key={a.id}
                  className="rounded-lg border border-gray-200 transition-colors hover:border-gray-300"
                >
                  <button
                    type="button"
                    className="flex w-full items-start justify-between gap-3 p-3 text-left"
                    onClick={() => setExpandedId(isExpanded ? null : a.id)}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900">{a.title}</p>
                      {!isExpanded && a.description && (
                        <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">{a.description}</p>
                      )}
                      <div className="mt-1 flex items-center gap-3">
                        <p className="flex items-center gap-1 text-xs text-gray-400">
                          <Calendar className="h-3 w-3" />
                          {t("assignment.due", { date: new Date(a.due_date).toLocaleDateString() })}
                        </p>
                        <SubmissionStats assignmentId={a.id} />
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                    ) : (
                      <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="border-t border-gray-100 px-3 py-3">
                      {a.description ? (
                        <p className="whitespace-pre-wrap text-sm text-gray-700">{a.description}</p>
                      ) : (
                        <p className="text-sm italic text-gray-400">{t("assignment.noDescription")}</p>
                      )}
                      <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                        <div>
                          <dt className="text-xs font-medium text-gray-400">{t("assignment.dueDate")}</dt>
                          <dd className="text-gray-700">{new Date(a.due_date).toLocaleString()}</dd>
                        </div>
                        <div>
                          <dt className="text-xs font-medium text-gray-400">{t("assignment.createdAt")}</dt>
                          <dd className="text-gray-700">{new Date(a.created_at).toLocaleDateString()}</dd>
                        </div>
                      </dl>
                      <div className="mt-3 flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1"
                          onClick={() => onRequestEdit(a)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          {t("assignment.edit")}
                        </Button>
                        <Button
                          variant="ghost-destructive"
                          size="sm"
                          className="gap-1"
                          onClick={() => {
                            if (window.confirm(t("assignment.confirmDelete"))) {
                              onDelete(a.id);
                            }
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {t("assignment.delete")}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
