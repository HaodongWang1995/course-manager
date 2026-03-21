import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useCallback, useRef, useEffect } from "react";
import { Card, Button, Badge } from "@course-manager/ui";
import { ArrowLeft, Star, Save, Send, Undo2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  useScheduleFeedbacks,
  useSaveStudentFeedback,
  useBatchSaveStudentFeedback,
  usePublishScheduleFeedbacks,
  useRevokeStudentFeedback,
} from "@/hooks/use-queries";
import type { ScheduleFeedbackStudent } from "@/api/client";

export const Route = createFileRoute("/(app)/teacher/student-feedback/$scheduleId")({
  component: TeacherStudentFeedbackPage,
});

interface CardState {
  rating: number | null;
  comment: string;
  suggestion: string;
  dirty: boolean;
  saving: boolean;
  error: string | null;
}

function TeacherStudentFeedbackPage() {
  const { scheduleId } = Route.useParams();
  const { t } = useTranslation();
  const { data, isLoading } = useScheduleFeedbacks(scheduleId);
  const saveMutation = useSaveStudentFeedback();
  const batchMutation = useBatchSaveStudentFeedback();
  const publishMutation = usePublishScheduleFeedbacks();
  const revokeMutation = useRevokeStudentFeedback();

  const [cardStates, setCardStates] = useState<Record<string, CardState>>({});
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const cardStatesRef = useRef(cardStates);
  cardStatesRef.current = cardStates;

  // Cleanup all timers on unmount
  useEffect(() => {
    return () => {
      for (const timer of Object.values(debounceTimers.current)) {
        clearTimeout(timer);
      }
    };
  }, []);

  // Initialize card states from server data
  useEffect(() => {
    if (!data?.students) return;
    setCardStates((prev) => {
      const next = { ...prev };
      for (const s of data.students) {
        if (!next[s.student_id] || !next[s.student_id].dirty) {
          next[s.student_id] = {
            rating: s.feedback?.rating ?? null,
            comment: s.feedback?.comment ?? "",
            suggestion: s.feedback?.suggestion ?? "",
            dirty: false,
            saving: false,
            error: null,
          };
        }
      }
      return next;
    });
  }, [data?.students]);

  const doSave = useCallback(
    async (studentId: string) => {
      // Read latest state from ref to avoid stale closure
      const state = cardStatesRef.current[studentId];
      if (!state || !state.dirty) return;

      setCardStates((prev) => ({
        ...prev,
        [studentId]: { ...prev[studentId], saving: true },
      }));

      try {
        await saveMutation.mutateAsync({
          schedule_id: scheduleId,
          student_id: studentId,
          rating: state.rating,
          comment: state.comment || null,
          suggestion: state.suggestion || null,
        });
        setCardStates((prev) => ({
          ...prev,
          [studentId]: { ...prev[studentId], dirty: false, saving: false, error: null },
        }));
      } catch (err) {
        setCardStates((prev) => ({
          ...prev,
          [studentId]: { ...prev[studentId], saving: false, error: String(err) },
        }));
      }
    },
    [saveMutation, scheduleId],
  );

  const updateField = useCallback(
    (studentId: string, field: "rating" | "comment" | "suggestion", value: number | null | string) => {
      setCardStates((prev) => ({
        ...prev,
        [studentId]: { ...prev[studentId], [field]: value, dirty: true, error: null },
      }));

      // Debounce auto-save 3s
      if (debounceTimers.current[studentId]) {
        clearTimeout(debounceTimers.current[studentId]);
      }
      debounceTimers.current[studentId] = setTimeout(() => {
        doSave(studentId);
      }, 3000);
    },
    [doSave],
  );

  const handleBatchSave = async () => {
    const currentStates = cardStatesRef.current;
    const dirtyItems = Object.entries(currentStates)
      .filter(([, s]) => s.dirty)
      .map(([studentId, s]) => ({
        student_id: studentId,
        rating: s.rating,
        comment: s.comment || null,
        suggestion: s.suggestion || null,
      }));

    if (dirtyItems.length === 0) return;

    const result = await batchMutation.mutateAsync({ schedule_id: scheduleId, feedbacks: dirtyItems });

    // Update states based on actual server result
    const successSet = new Set(result.success);
    const deletedSet = new Set(result.deleted);
    const errorMap = new Map(result.errors.map((e) => [e.student_id, e.error]));

    setCardStates((prev) => {
      const next = { ...prev };
      for (const item of dirtyItems) {
        const sid = item.student_id;
        if (!next[sid]) continue;
        if (successSet.has(sid) || deletedSet.has(sid)) {
          next[sid] = { ...next[sid], dirty: false, saving: false, error: null };
        } else if (errorMap.has(sid)) {
          next[sid] = { ...next[sid], saving: false, error: errorMap.get(sid)! };
        }
        // skipped items stay dirty so user can revoke and retry
      }
      return next;
    });
  };

  const handlePublish = async () => {
    // Save dirty items first
    await handleBatchSave();
    await publishMutation.mutateAsync(scheduleId);
    setShowPublishConfirm(false);
  };

  const handleRevoke = async (feedbackId: string) => {
    await revokeMutation.mutateAsync(feedbackId);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8 text-slate-400">Loading...</div>;
  }

  if (!data) {
    return <div className="p-8 text-center text-slate-400">Not found</div>;
  }

  const lessonDate = data.schedule.start_time
    ? new Date(data.schedule.start_time).toLocaleDateString("zh-CN")
    : "";

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 pb-24 lg:p-6 lg:pb-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/teacher/courses/$courseId" params={{ courseId: data.course.id }}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-lg font-semibold text-slate-900">
            {data.course.title}
          </h1>
          <p className="text-sm text-slate-500">
            {t("studentLessonFeedback.writeFeedback")} · 第{data.schedule.lesson_number}课 · {lessonDate}
          </p>
        </div>
      </div>

      {/* Student Cards */}
      {data.students.map((student) => (
        <StudentFeedbackCard
          key={student.student_id}
          student={student}
          state={cardStates[student.student_id]}
          onUpdateField={(field, value) => updateField(student.student_id, field, value)}
          onRevoke={student.feedback?.id ? () => handleRevoke(student.feedback!.id) : undefined}
          t={t}
        />
      ))}

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-white p-4 lg:static lg:border-0 lg:bg-transparent lg:p-0">
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={handleBatchSave}
            disabled={batchMutation.isPending || !Object.values(cardStates).some((s) => s.dirty)}
          >
            <Save className="mr-2 h-4 w-4" />
            {t("studentLessonFeedback.saveAllDrafts")}
          </Button>
          <Button onClick={() => setShowPublishConfirm(true)} disabled={publishMutation.isPending}>
            <Send className="mr-2 h-4 w-4" />
            {t("studentLessonFeedback.publishAll")}
          </Button>
        </div>
      </div>

      {/* Publish Confirm Dialog */}
      {showPublishConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="mx-4 max-w-md p-6">
            <p className="mb-4 text-slate-700">{t("studentLessonFeedback.publishConfirm")}</p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowPublishConfirm(false)}>
                取消
              </Button>
              <Button onClick={handlePublish} disabled={publishMutation.isPending}>
                确认发布
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function StudentFeedbackCard({
  student,
  state,
  onUpdateField,
  onRevoke,
  t,
}: {
  student: ScheduleFeedbackStudent;
  state: CardState | undefined;
  onUpdateField: (field: "rating" | "comment" | "suggestion", value: number | null | string) => void;
  onRevoke?: () => void;
  t: (key: string) => string;
}) {
  const isPublished = student.feedback?.status === "published";
  const rating = state?.rating ?? student.feedback?.rating ?? null;
  const comment = state?.comment ?? student.feedback?.comment ?? "";
  const suggestion = state?.suggestion ?? student.feedback?.suggestion ?? "";

  const statusLabel = isPublished
    ? t("studentLessonFeedback.statusPublished")
    : state?.saving
      ? t("studentLessonFeedback.saving")
      : student.feedback
        ? t("studentLessonFeedback.statusDraft")
        : t("studentLessonFeedback.statusNotWritten");

  const statusVariant = isPublished ? "default" : student.feedback ? "secondary" : "outline";

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-600">
            {student.student_name?.charAt(0) || "?"}
          </div>
          <span className="font-medium text-slate-900">{student.student_name}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={statusVariant}>{statusLabel}</Badge>
          {isPublished && onRevoke && (
            <Button variant="ghost" size="sm" onClick={onRevoke}>
              <Undo2 className="mr-1 h-3 w-3" />
              {t("studentLessonFeedback.revoke")}
            </Button>
          )}
        </div>
      </div>

      {/* Rating */}
      <div>
        <label className="mb-1 block text-sm text-slate-500">{t("studentLessonFeedback.rating")}</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              disabled={isPublished}
              className="p-1 disabled:cursor-not-allowed"
              onClick={() => onUpdateField("rating", rating === n ? null : n)}
            >
              <Star
                className={`h-6 w-6 ${n <= (rating ?? 0) ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Comment */}
      <div>
        <label className="mb-1 block text-sm text-slate-500">{t("studentLessonFeedback.comment")}</label>
        <textarea
          className="w-full rounded-md border border-slate-200 p-2 text-sm focus:border-blue-500 focus:outline-none disabled:bg-slate-50 disabled:text-slate-500"
          rows={2}
          disabled={isPublished}
          placeholder={t("studentLessonFeedback.commentPlaceholder")}
          value={comment}
          onChange={(e) => onUpdateField("comment", e.target.value)}
        />
      </div>

      {/* Suggestion */}
      <div>
        <label className="mb-1 block text-sm text-slate-500">{t("studentLessonFeedback.suggestion")}</label>
        <textarea
          className="w-full rounded-md border border-slate-200 p-2 text-sm focus:border-blue-500 focus:outline-none disabled:bg-slate-50 disabled:text-slate-500"
          rows={2}
          disabled={isPublished}
          placeholder={t("studentLessonFeedback.suggestionPlaceholder")}
          value={suggestion}
          onChange={(e) => onUpdateField("suggestion", e.target.value)}
        />
      </div>

      {state?.error && <p className="text-xs text-red-500">{state.error}</p>}
    </Card>
  );
}
