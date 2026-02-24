import { useState, useEffect } from "react";
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
import type { Assignment } from "@/api/client";

function toDatetimeLocal(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface AssignmentDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (data: { title: string; description?: string; due_date: string }) => void;
  isLoading: boolean;
  /** When provided, dialog operates in edit mode */
  editData?: Assignment | null;
}

export function AddAssignmentDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  editData,
}: AssignmentDialogProps) {
  const { t } = useTranslation("teacherCourseDetail");
  const isEdit = !!editData;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  // Reset form when dialog opens or editData changes
  useEffect(() => {
    if (open) {
      setTitle(editData?.title ?? "");
      setDescription(editData?.description ?? "");
      setDueDate(editData ? toDatetimeLocal(editData.due_date) : "");
    }
  }, [open, editData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;
    onSubmit({
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
          <DialogTitle>
            {isEdit ? t("editAssignment.title") : t("addAssignment.title")}
          </DialogTitle>
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
              {isLoading
                ? t("addAssignment.submitting")
                : isEdit
                  ? t("editAssignment.submit")
                  : t("addAssignment.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
