import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Input,
  Label,
  AttachmentList,
} from "@course-manager/ui";
import {
  ArrowLeft,
  Clock,
  User,
  MapPin,
  Calendar,
  BookOpen,
  CheckCircle,
  XCircle,
  Loader2,
  Paperclip,
  ExternalLink,
  Download,
} from "lucide-react";
import {
  useCourseDetail,
  useMyEnrollments,
  useApplyEnrollment,
  useCourseAttachments,
  useScheduleAttachments,
} from "@/hooks/use-queries";
import type { Schedule } from "@/api/client";

const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  approved: "default",
  rejected: "destructive",
};

function isUrl(str: string) {
  return /^https?:\/\//i.test(str);
}

interface ScheduleItemProps {
  schedule: Schedule;
}

function ScheduleItem({ schedule }: ScheduleItemProps) {
  const { t } = useTranslation("studentCourseDetail");
  const { data: attachments = [] } = useScheduleAttachments(schedule.id);

  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">
          {schedule.lesson_number}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900">
            {schedule.title || t("schedule.lesson", { number: schedule.lesson_number })}
          </h4>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {new Date(schedule.start_time).toLocaleString("zh-CN")} -{" "}
              {new Date(schedule.end_time).toLocaleTimeString("zh-CN")}
            </span>
            {schedule.room && (
              isUrl(schedule.room) ? (
                <a
                  href={schedule.room}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:underline font-medium"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  {t("schedule.joinRoom")}
                </a>
              ) : (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {schedule.room}
                </span>
              )
            )}
          </div>
        </div>
      </div>

      {/* Per-schedule attachments */}
      {attachments.length > 0 && (
        <div className="mt-3 border-t border-gray-100 pt-3">
          <p className="mb-2 text-xs font-medium text-gray-500">{t("schedule.scheduleAttachments")}</p>
          <div className="space-y-1">
            {attachments.map((att) => (
              <a
                key={att.id}
                href={att.download_url ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 hover:underline"
              >
                <Download className="h-3 w-3 shrink-0" />
                <span className="truncate">{att.filename}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface StudentCourseDetailPageProps {
  courseId: string;
}

export function StudentCourseDetailPage({ courseId }: StudentCourseDetailPageProps) {
  const { t } = useTranslation("studentCourseDetail");
  const navigate = useNavigate();
  const { data: course, isLoading } = useCourseDetail(courseId);
  const { data: enrollments = [] } = useMyEnrollments();
  const applyMutation = useApplyEnrollment();
  const { data: attachments = [] } = useCourseAttachments(courseId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [note, setNote] = useState("");
  const [applied, setApplied] = useState(false);

  const existingEnrollment = enrollments.find((e) => e.course_id === courseId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">{t("loading")}</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-gray-500">{t("notFound")}</p>
        <Button className="mt-4" variant="outline" onClick={() => navigate({ to: "/student" })}>
          {t("back")}
        </Button>
      </div>
    );
  }

  const handleApply = () => {
    applyMutation.mutate(
      { course_id: courseId, note: note || undefined },
      {
        onSuccess: () => {
          setDialogOpen(false);
          setNote("");
          setApplied(true);
        },
      },
    );
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Back Button */}
      <Button variant="ghost" className="gap-2" onClick={() => navigate({ to: "/student" })}>
        <ArrowLeft className="h-4 w-4" />
        {t("back")}
      </Button>

      {/* Course Info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {course.category && (
                <Badge variant="outline" className="mb-3">{course.category}</Badge>
              )}
              <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
            </div>
            {course.price > 0 ? (
              <div className="text-2xl font-bold text-blue-600">
                ¥{Number(course.price).toFixed(2)}
              </div>
            ) : (
              <Badge className="bg-green-50 text-green-700 border-green-200" variant="outline">
                {t("free")}
              </Badge>
            )}
          </div>

          <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              {course.teacher_name}
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4" />
              {t("lessons", { count: course.schedules?.length || 0 })}
            </span>
          </div>

          {course.description && (
            <div className="mt-6">
              <h2 className="text-sm font-semibold text-gray-900">{t("description")}</h2>
              <p className="mt-2 whitespace-pre-line text-sm text-gray-600">{course.description}</p>
            </div>
          )}

          {/* Enrollment Action */}
          <div className="mt-6 border-t border-gray-100 pt-4">
            {existingEnrollment ? (
              <div className="flex items-center gap-3">
                {existingEnrollment.status === "approved" && <CheckCircle className="h-5 w-5 text-green-500" />}
                {existingEnrollment.status === "rejected" && <XCircle className="h-5 w-5 text-red-500" />}
                {existingEnrollment.status === "pending" && <Clock className="h-5 w-5 text-yellow-500" />}
                <span className="text-sm text-gray-600">{t("enrollmentStatus")}</span>
                <Badge variant={statusVariants[existingEnrollment.status] || "outline"}>
                  {existingEnrollment.status === "pending" && t("status.pending")}
                  {existingEnrollment.status === "approved" && t("status.approved")}
                  {existingEnrollment.status === "rejected" && t("status.rejected")}
                  {!["pending", "approved", "rejected"].includes(existingEnrollment.status) && existingEnrollment.status}
                </Badge>
                {existingEnrollment.reject_reason && (
                  <span className="text-sm text-red-500">（{existingEnrollment.reject_reason}）</span>
                )}
              </div>
            ) : applied ? (
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm text-gray-600">{t("applySuccess")}</span>
                <Button variant="link" size="sm" onClick={() => navigate({ to: "/student/enrollments" })}>
                  {t("viewEnrollments")}
                </Button>
              </div>
            ) : (
              <Button onClick={() => setDialogOpen(true)} className="w-full sm:w-auto">
                {t("applyButton")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Schedule with per-lesson attachments */}
      {course.schedules && course.schedules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {t("schedule.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {course.schedules.map((schedule) => (
                <ScheduleItem key={schedule.id} schedule={schedule} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Course-level Attachments */}
      {attachments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Paperclip className="h-5 w-5" />
              {t("attachments.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AttachmentList attachments={attachments} emptyText={t("attachments.title")} />
          </CardContent>
        </Card>
      )}

      {/* Enrollment Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("applyDialog.title")}</DialogTitle>
            <DialogDescription>{t("applyDialog.description")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="note">{t("applyDialog.description")}</Label>
              <Input
                id="note"
                placeholder={t("applyDialog.notePlaceholder")}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t("applyDialog.cancel")}</Button>
            <Button onClick={handleApply} disabled={applyMutation.isPending}>
              {applyMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("applyDialog.submit")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
