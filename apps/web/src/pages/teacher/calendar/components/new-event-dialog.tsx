import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@course-manager/ui";
import { useForm } from "@tanstack/react-form";
import { useTranslation } from "react-i18next";
import { newEventFormValidator } from "@/lib/schemas";
import type { Course } from "@/api/client";

interface NewEventDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  courses: Course[];
  onAdd: (data: {
    courseId: string;
    title?: string;
    start_time: string;
    end_time: string;
    room?: string;
  }) => void;
  isLoading: boolean;
}

export function NewEventDialog({
  open,
  onOpenChange,
  courses,
  onAdd,
  isLoading,
}: NewEventDialogProps) {
  const form = useForm({
    defaultValues: { course_id: "", title: "", start_time: "", end_time: "", room: "" },
    validators: { onChange: newEventFormValidator },
    onSubmit: ({ value }) => {
      onAdd({
        courseId: value.course_id,
        title: value.title || undefined,
        start_time: value.start_time,
        end_time: value.end_time,
        room: value.room || undefined,
      });
    },
  });

  const { t } = useTranslation("teacherCalendar");

  const handleOpenChange = (v: boolean) => {
    onOpenChange(v);
    if (!v) form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{t("dialog.title")}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          {/* Course select */}
          <form.Field name="course_id">
            {(field) => (
              <div className="space-y-2">
                <Label>{t("dialog.course")} <span className="text-red-400">*</span></Label>
                <Select value={field.state.value} onValueChange={(v) => field.handleChange(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("dialog.selectCourse")} />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {field.state.meta.errors.length > 0 && (
                  <p className="text-xs text-red-500">{String(field.state.meta.errors[0])}</p>
                )}
              </div>
            )}
          </form.Field>

          {/* Title */}
          <form.Field name="title">
            {(field) => (
              <div className="space-y-2">
                <Label>{t("dialog.titleOptional")}</Label>
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder={t("dialog.lessonTitlePlaceholder")}
                />
              </div>
            )}
          </form.Field>

          {/* Start / End time */}
          <div className="grid grid-cols-2 gap-4">
            <form.Field name="start_time">
              {(field) => (
                <div className="space-y-2">
                  <Label>{t("dialog.startTime")} <span className="text-red-400">*</span></Label>
                  <Input
                    type="datetime-local"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-xs text-red-500">{String(field.state.meta.errors[0])}</p>
                  )}
                </div>
              )}
            </form.Field>
            <form.Field name="end_time">
              {(field) => (
                <div className="space-y-2">
                  <Label>{t("dialog.endTime")} <span className="text-red-400">*</span></Label>
                  <Input
                    type="datetime-local"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-xs text-red-500">{String(field.state.meta.errors[0])}</p>
                  )}
                </div>
              )}
            </form.Field>
          </div>

          {/* Room */}
          <form.Field name="room">
            {(field) => (
              <div className="space-y-2">
                <Label>{t("dialog.roomOptional")}</Label>
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder={t("dialog.roomPlaceholder")}
                />
              </div>
            )}
          </form.Field>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              {t("dialog.cancel")}
            </Button>
            <form.Subscribe selector={(s) => s.canSubmit}>
              {(canSubmit) => (
                <Button type="submit" disabled={!canSubmit || isLoading}>
                  {isLoading ? t("dialog.creating") : t("dialog.createEvent")}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
