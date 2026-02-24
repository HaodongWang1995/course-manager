import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@course-manager/ui";
import { ArrowLeft } from "lucide-react";
import type { Schedule, Assignment } from "@/api/client";
import {
  useCourseDetail,
  useUpdateCourse,
  useUpdateCourseStatus,
  useAddSchedule,
  useUpdateSchedule,
  useDeleteSchedule,
  useCourseAttachments,
  useUploadAttachment,
  useDeleteAttachment,
  useCourseAssignments,
  useCreateAssignment,
  useUpdateAssignment,
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
  const updateScheduleMutation = useUpdateSchedule();
  const deleteScheduleMutation = useDeleteSchedule();
  const { data: attachments = [] } = useCourseAttachments(courseId);
  const uploadMutation = useUploadAttachment();
  const deleteAttachmentMutation = useDeleteAttachment();
  const { data: assignments = [] } = useCourseAssignments(courseId);
  const createAssignmentMutation = useCreateAssignment();
  const updateAssignmentMutation = useUpdateAssignment();
  const deleteAssignmentMutation = useDeleteAssignment();

  // Dialog state
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);

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

  const handleOpenAddSchedule = () => {
    setEditingSchedule(null);
    setShowScheduleDialog(true);
  };

  const handleOpenEditSchedule = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setShowScheduleDialog(true);
  };

  const handleScheduleSubmit = (data: {
    lesson_number: number;
    title: string;
    start_time: string;
    end_time: string;
    room: string;
  }) => {
    if (editingSchedule) {
      updateScheduleMutation.mutate(
        { id: editingSchedule.id, data },
        { onSuccess: () => setShowScheduleDialog(false) },
      );
    } else {
      addScheduleMutation.mutate(
        { courseId, data },
        { onSuccess: () => setShowScheduleDialog(false) },
      );
    }
  };

  const handleOpenAddAssignment = () => {
    setEditingAssignment(null);
    setShowAssignmentDialog(true);
  };

  const handleOpenEditAssignment = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setShowAssignmentDialog(true);
  };

  const handleAssignmentSubmit = (data: { title: string; description?: string; due_date: string }) => {
    if (editingAssignment) {
      updateAssignmentMutation.mutate(
        { id: editingAssignment.id, data },
        { onSuccess: () => setShowAssignmentDialog(false) },
      );
    } else {
      createAssignmentMutation.mutate(
        { courseId, data },
        { onSuccess: () => setShowAssignmentDialog(false) },
      );
    }
  };

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
        onRequestAdd={handleOpenAddSchedule}
        onRequestEdit={handleOpenEditSchedule}
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
        onRequestAdd={handleOpenAddAssignment}
        onRequestEdit={handleOpenEditAssignment}
      />

      {/* Schedule Dialog (Add / Edit) */}
      <AddScheduleDialog
        open={showScheduleDialog}
        onOpenChange={setShowScheduleDialog}
        nextLessonNumber={(course.schedules?.length || 0) + 1}
        onSubmit={handleScheduleSubmit}
        isLoading={editingSchedule ? updateScheduleMutation.isPending : addScheduleMutation.isPending}
        editData={editingSchedule}
      />

      {/* Assignment Dialog (Add / Edit) */}
      <AddAssignmentDialog
        open={showAssignmentDialog}
        onOpenChange={setShowAssignmentDialog}
        onSubmit={handleAssignmentSubmit}
        isLoading={editingAssignment ? updateAssignmentMutation.isPending : createAssignmentMutation.isPending}
        editData={editingAssignment}
      />
    </div>
  );
}
