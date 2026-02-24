import { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@course-manager/ui";
import { useForm } from "@tanstack/react-form";
import { scheduleFormValidator } from "@/lib/schemas";
import { FormTextField, FormDateTimeField } from "@/components/form-field";
import { useTranslation } from "react-i18next";
import type { Schedule } from "@/api/client";

interface ScheduleDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  nextLessonNumber: number;
  onSubmit: (data: {
    lesson_number: number;
    title: string;
    start_time: string;
    end_time: string;
    room: string;
  }) => void;
  isLoading: boolean;
  /** When provided, dialog operates in edit mode */
  editData?: Schedule | null;
}

function toDatetimeLocal(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function AddScheduleDialog({
  open,
  onOpenChange,
  nextLessonNumber,
  onSubmit,
  isLoading,
  editData,
}: ScheduleDialogProps) {
  const { t } = useTranslation("teacherCourseDetail");
  const [roomType, setRoomType] = useState<"physical" | "online">("physical");
  const isEdit = !!editData;

  const form = useForm({
    defaultValues: {
      lesson_number: (editData?.lesson_number ?? nextLessonNumber) as number | undefined,
      title: (editData?.title ?? "") as string | undefined,
      start_time: editData ? toDatetimeLocal(editData.start_time) : "",
      end_time: editData ? toDatetimeLocal(editData.end_time) : "",
      room: (editData?.room ?? "") as string | undefined,
    },
    validators: {
      onChange: scheduleFormValidator,
    },
    onSubmit: ({ value }) => {
      onSubmit({
        lesson_number: value.lesson_number ?? nextLessonNumber,
        title: value.title ?? "",
        start_time: value.start_time,
        end_time: value.end_time,
        room: value.room ?? "",
      });
      form.reset();
      setRoomType("physical");
    },
  });

  // Reset form when editData changes
  useEffect(() => {
    if (open) {
      form.reset();
      form.setFieldValue("lesson_number", editData?.lesson_number ?? nextLessonNumber);
      form.setFieldValue("title", editData?.title ?? "");
      form.setFieldValue("start_time", editData ? toDatetimeLocal(editData.start_time) : "");
      form.setFieldValue("end_time", editData ? toDatetimeLocal(editData.end_time) : "");
      form.setFieldValue("room", editData?.room ?? "");
      if (editData?.room?.startsWith("http")) {
        setRoomType("online");
      } else {
        setRoomType("physical");
      }
    }
  }, [open, editData]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t("editSchedule.title") : t("addSchedule.title")}
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <form.Field name="lesson_number">
              {(field) => (
                <FormTextField field={field} label={t("addSchedule.fields.lessonNumber")} type="number" />
              )}
            </form.Field>

            {/* Location type toggle */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">{t("addSchedule.fields.locationType")}</label>
              <div className="flex rounded-md border border-gray-200 overflow-hidden">
                <button
                  type="button"
                  className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                    roomType === "physical"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                  onClick={() => setRoomType("physical")}
                >
                  {t("addSchedule.locationType.physical")}
                </button>
                <button
                  type="button"
                  className={`flex-1 px-3 py-2 text-sm font-medium transition-colors border-l border-gray-200 ${
                    roomType === "online"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                  onClick={() => setRoomType("online")}
                >
                  {t("addSchedule.locationType.online")}
                </button>
              </div>
            </div>
          </div>

          {/* Room field — label + placeholder changes based on type */}
          <form.Field name="room">
            {(field) => (
              <FormTextField
                field={field}
                label={roomType === "online" ? t("addSchedule.fields.roomUrl") : t("addSchedule.fields.room")}
                placeholder={roomType === "online" ? t("addSchedule.placeholders.roomUrl") : t("addSchedule.placeholders.room")}
                type={roomType === "online" ? "url" : "text"}
              />
            )}
          </form.Field>

          <form.Field name="title">
            {(field) => (
              <FormTextField field={field} label={t("addSchedule.fields.lessonTitle")} placeholder={t("addSchedule.placeholders.title")} />
            )}
          </form.Field>

          <div className="grid grid-cols-2 gap-4">
            <form.Field name="start_time">
              {(field) => (
                <FormDateTimeField field={field} label={t("addSchedule.fields.startTime")} required />
              )}
            </form.Field>
            <form.Field name="end_time">
              {(field) => (
                <FormDateTimeField field={field} label={t("addSchedule.fields.endTime")} required />
              )}
            </form.Field>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("addSchedule.cancel")}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? t("addSchedule.submitting")
                : isEdit
                  ? t("editSchedule.submit")
                  : t("addSchedule.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
