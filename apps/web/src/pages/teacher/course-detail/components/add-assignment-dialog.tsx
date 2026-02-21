import { useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from "@course-manager/ui";
import { useTranslation } from "react-i18next";

interface AddAssignmentDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onAdd: (data: { title: string; description?: string; due_date: string }) => void;
  isLoading: boolean;
}

export function AddAssignmentDialog({
  open,
  onOpenChange,
  onAdd,
  isLoading,
}: AddAssignmentDialogProps) {
  const { t } = useTranslation("teacherCourseDetail");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;
    onAdd({
      title: title.trim(),
      description: description.trim() || undefined,
      due_date: dueDate,
    });
  };

  const handleClose = (v: boolean) => {
    if (!v) {
      setTitle("");
      setDescription("");
      setDueDate("");
    }
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("addAssignment.title")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="assignment-title">{t("addAssignment.fields.title")}</Label>
            <Input
              id="assignment-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("addAssignment.placeholders.title")}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="assignment-desc">{t("addAssignment.fields.description")}</Label>
            <Input
              id="assignment-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("addAssignment.placeholders.description")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="assignment-due">{t("addAssignment.fields.dueDate")}</Label>
            <Input
              id="assignment-due"
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleClose(false)}>
              {t("addAssignment.cancel")}
            </Button>
            <Button type="submit" disabled={isLoading || !title.trim() || !dueDate}>
              {isLoading ? t("addAssignment.submitting") : t("addAssignment.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
