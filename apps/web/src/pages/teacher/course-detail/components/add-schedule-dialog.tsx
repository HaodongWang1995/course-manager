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

interface AddScheduleDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  nextLessonNumber: number;
  onAdd: (data: {
    lesson_number: number;
    title: string;
    start_time: string;
    end_time: string;
    room: string;
  }) => void;
  isLoading: boolean;
}

export function AddScheduleDialog({
  open,
  onOpenChange,
  nextLessonNumber,
  onAdd,
  isLoading,
}: AddScheduleDialogProps) {
  const form = useForm({
    defaultValues: {
      lesson_number: nextLessonNumber as number | undefined,
      title: "" as string | undefined,
      start_time: "",
      end_time: "",
      room: "" as string | undefined,
    },
    validators: {
      onChange: scheduleFormValidator,
    },
    onSubmit: ({ value }) => {
      onAdd({
        lesson_number: value.lesson_number ?? nextLessonNumber,
        title: value.title ?? "",
        start_time: value.start_time,
        end_time: value.end_time,
        room: value.room ?? "",
      });
      form.reset();
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>添加课时</DialogTitle>
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
                <FormTextField field={field} label="课时编号" type="number" />
              )}
            </form.Field>
            <form.Field name="room">
              {(field) => (
                <FormTextField field={field} label="教室" placeholder="例如: A-301" />
              )}
            </form.Field>
          </div>

          <form.Field name="title">
            {(field) => (
              <FormTextField field={field} label="课时标题" placeholder="例如: 矩阵基础" />
            )}
          </form.Field>

          <div className="grid grid-cols-2 gap-4">
            <form.Field name="start_time">
              {(field) => (
                <FormDateTimeField field={field} label="开始时间" required />
              )}
            </form.Field>
            <form.Field name="end_time">
              {(field) => (
                <FormDateTimeField field={field} label="结束时间" required />
              )}
            </form.Field>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "添加中..." : "添加课时"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
