import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
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
} from "lucide-react";
import {
  useCourseDetail,
  useMyEnrollments,
  useApplyEnrollment,
  useCourseAttachments,
} from "@/hooks/use-queries";

export const Route = createFileRoute("/(app)/student/courses/$courseId")({
  component: StudentCourseDetail,
});

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "审核中", variant: "secondary" },
  approved: { label: "已通过", variant: "default" },
  rejected: { label: "已拒绝", variant: "destructive" },
};

function StudentCourseDetail() {
  const { courseId } = Route.useParams();
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
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-gray-500">课程不存在</p>
        <Button className="mt-4" variant="outline" onClick={() => navigate({ to: "/student" })}>
          返回课程列表
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
      <Button
        variant="ghost"
        className="gap-2"
        onClick={() => navigate({ to: "/student" })}
      >
        <ArrowLeft className="h-4 w-4" />
        返回课程列表
      </Button>

      {/* Course Info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {course.category && (
                <Badge variant="outline" className="mb-3">
                  {course.category}
                </Badge>
              )}
              <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
            </div>
            {course.price > 0 ? (
              <div className="text-2xl font-bold text-blue-600">
                ¥{Number(course.price).toFixed(2)}
              </div>
            ) : (
              <Badge className="bg-green-50 text-green-700 border-green-200" variant="outline">
                免费
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
              {course.schedules?.length || 0} 节课
            </span>
          </div>

          {course.description && (
            <div className="mt-6">
              <h2 className="text-sm font-semibold text-gray-900">课程简介</h2>
              <p className="mt-2 whitespace-pre-line text-sm text-gray-600">
                {course.description}
              </p>
            </div>
          )}

          {/* Enrollment Action */}
          <div className="mt-6 border-t border-gray-100 pt-4">
            {existingEnrollment ? (
              <div className="flex items-center gap-3">
                {existingEnrollment.status === "approved" && <CheckCircle className="h-5 w-5 text-green-500" />}
                {existingEnrollment.status === "rejected" && <XCircle className="h-5 w-5 text-red-500" />}
                {existingEnrollment.status === "pending" && <Clock className="h-5 w-5 text-yellow-500" />}
                <span className="text-sm text-gray-600">选课状态：</span>
                <Badge variant={statusLabels[existingEnrollment.status]?.variant || "outline"}>
                  {statusLabels[existingEnrollment.status]?.label || existingEnrollment.status}
                </Badge>
                {existingEnrollment.reject_reason && (
                  <span className="text-sm text-red-500">（{existingEnrollment.reject_reason}）</span>
                )}
              </div>
            ) : applied ? (
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm text-gray-600">申请已提交！</span>
                <Button variant="link" size="sm" onClick={() => navigate({ to: "/student/enrollments" })}>
                  查看我的选课
                </Button>
              </div>
            ) : (
              <Button onClick={() => setDialogOpen(true)} className="w-full sm:w-auto">
                申请选课
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Schedule */}
      {course.schedules && course.schedules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              课程日程
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {course.schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="flex items-center gap-4 rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">
                    {schedule.lesson_number}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">
                      {schedule.title || `第 ${schedule.lesson_number} 课`}
                    </h4>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(schedule.start_time).toLocaleString("zh-CN")} -{" "}
                        {new Date(schedule.end_time).toLocaleTimeString("zh-CN")}
                      </span>
                      {schedule.room && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {schedule.room}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attachments */}
      {attachments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Paperclip className="h-5 w-5" />
              课程附件
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AttachmentList attachments={attachments} />
          </CardContent>
        </Card>
      )}

      {/* Enrollment Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>申请选课</DialogTitle>
            <DialogDescription>
              申请加入「{course.title}」
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="note">备注（可选）</Label>
              <Input
                id="note"
                placeholder="向老师说明你的选课原因..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleApply} disabled={applyMutation.isPending}>
              {applyMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              提交申请
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
