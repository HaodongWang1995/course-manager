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

  const handleOpenChange = (v: boolean) => {
    onOpenChange(v);
    if (!v) form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>New Event</DialogTitle>
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
                <Label>Course <span className="text-red-400">*</span></Label>
                <Select value={field.state.value} onValueChange={(v) => field.handleChange(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
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
                <Label>Title (optional)</Label>
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="Lesson title"
                />
              </div>
            )}
          </form.Field>

          {/* Start / End time */}
          <div className="grid grid-cols-2 gap-4">
            <form.Field name="start_time">
              {(field) => (
                <div className="space-y-2">
                  <Label>Start Time <span className="text-red-400">*</span></Label>
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
                  <Label>End Time <span className="text-red-400">*</span></Label>
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
                <Label>Room (optional)</Label>
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="e.g. A-301"
                />
              </div>
            )}
          </form.Field>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <form.Subscribe selector={(s) => s.canSubmit}>
              {(canSubmit) => (
                <Button type="submit" disabled={!canSubmit || isLoading}>
                  {isLoading ? "Creating..." : "Create Event"}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
