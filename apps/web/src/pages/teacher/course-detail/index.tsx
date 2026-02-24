import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@course-manager/ui";
import { ArrowLeft } from "lucide-react";
import {
  useCourseDetail,
  useUpdateCourse,
  useUpdateCourseStatus,
  useAddSchedule,
  useDeleteSchedule,
  useCourseAttachments,
  useUploadAttachment,
  useDeleteAttachment,
  useCourseAssignments,
  useCreateAssignment,
  useDeleteAssignment,
} from "@/hooks/use-queries";
import { CourseInfoCard } from "./components/course-info-card";
import { ScheduleSection } from "./components/schedule-section";
import { AddScheduleDialog } from "./components/add-schedule-dialog";
import { AttachmentSection } from "./components/attachment-section";
import { AssignmentSection } from "./components/assignment-section";
import { AddAssignmentDialog } from "./components/add-assignment-dialog";

interface TeacherCourseDetailPageProps {
  courseId: string;
}

export function TeacherCourseDetailPage({ courseId }: TeacherCourseDetailPageProps) {
  const { t } = useTranslation("teacherCourseDetail");
  const navigate = useNavigate();

  // Data hooks
  const { data: course, isLoading } = useCourseDetail(courseId);
  const updateMutation = useUpdateCourse();
  const statusMutation = useUpdateCourseStatus();
  const addScheduleMutation = useAddSchedule();
  const deleteScheduleMutation = useDeleteSchedule();
  const { data: attachments = [] } = useCourseAttachments(courseId);
  const uploadMutation = useUploadAttachment();
  const deleteAttachmentMutation = useDeleteAttachment();
  const { data: assignments = [] } = useCourseAssignments(courseId);
  const createAssignmentMutation = useCreateAssignment();
  const deleteAssignmentMutation = useDeleteAssignment();
  // Dialog state
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [showAddAssignment, setShowAddAssignment] = useState(false);

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
        <Button
          className="mt-4"
          variant="outline"
          onClick={() => navigate({ to: "/teacher/courses" })}
        >
          {t("back")}
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          className="gap-2"
          onClick={() => navigate({ to: "/teacher/courses" })}
        >
          <ArrowLeft className="h-4 w-4" />
          {t("back")}
        </Button>
      </div>

      {/* Course info card (with edit + status controls) */}
      <CourseInfoCard
        course={course}
        onSave={(data) => updateMutation.mutate({ id: courseId, data })}
        isSaving={updateMutation.isPending}
        onStatusChange={(status) => statusMutation.mutate({ id: courseId, status })}
      />

      {/* Schedules */}
      <ScheduleSection
        schedules={course.schedules || []}
        onDelete={(id) => deleteScheduleMutation.mutate(id)}
        onRequestAdd={() => setShowAddSchedule(true)}
      />

      {/* Attachments */}
      <AttachmentSection
        attachments={attachments}
        onFileSelect={(files) => {
          for (const file of files) {
            uploadMutation.mutate({ file, courseId });
          }
        }}
        uploading={uploadMutation.isPending}
        onDelete={(id) => deleteAttachmentMutation.mutate(id)}
        isDeleting={deleteAttachmentMutation.isPending}
        uploadPromptText={t("upload.prompt")}
        maxSizeText={t("upload.maxSize", { mb: 50 })}
        uploadingText={t("upload.uploading")}
        tooLargeText={t("upload.tooLarge", { mb: 50 })}
        emptyText={t("attachments.empty")}
      />

      {/* Assignments */}
      <AssignmentSection
        assignments={assignments}
        onDelete={(id) => deleteAssignmentMutation.mutate({ id, courseId })}
        onRequestAdd={() => setShowAddAssignment(true)}
      />

      {/* Dialogs */}
      <AddScheduleDialog
        open={showAddSchedule}
        onOpenChange={setShowAddSchedule}
        nextLessonNumber={(course.schedules?.length || 0) + 1}
        onAdd={(data) =>
          addScheduleMutation.mutate(
            { courseId, data },
            { onSuccess: () => setShowAddSchedule(false) }
          )
        }
        isLoading={addScheduleMutation.isPending}
      />

      <AddAssignmentDialog
        open={showAddAssignment}
        onOpenChange={setShowAddAssignment}
        onAdd={(data) =>
          createAssignmentMutation.mutate(
            { courseId, data },
            { onSuccess: () => setShowAddAssignment(false) }
          )
        }
        isLoading={createAssignmentMutation.isPending}
      />

    </div>
  );
}
