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
          <DialogTitle>添加作业</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="assignment-title">标题 *</Label>
            <Input
              id="assignment-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：第一章课后练习"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="assignment-desc">说明（可选）</Label>
            <Input
              id="assignment-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="作业内容说明"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="assignment-due">截止日期 *</Label>
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
              取消
            </Button>
            <Button type="submit" disabled={isLoading || !title.trim() || !dueDate}>
              {isLoading ? "添加中..." : "添加作业"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
