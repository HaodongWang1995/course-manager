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

interface AddResourceDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onAdd: (data: {
    title: string;
    file_type?: string;
    file_size?: string;
    featured?: boolean;
  }) => void;
  isLoading: boolean;
}

export function AddResourceDialog({
  open,
  onOpenChange,
  onAdd,
  isLoading,
}: AddResourceDialogProps) {
  const [title, setTitle] = useState("");
  const [fileType, setFileType] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [featured, setFeatured] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({
      title: title.trim(),
      file_type: fileType.trim() || undefined,
      file_size: fileSize.trim() || undefined,
      featured,
    });
  };

  const handleClose = (v: boolean) => {
    if (!v) {
      setTitle("");
      setFileType("");
      setFileSize("");
      setFeatured(false);
    }
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>添加课程资源</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="res-title">资源名称 *</Label>
            <Input
              id="res-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：第一章讲义.pdf"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="res-type">文件类型</Label>
              <Input
                id="res-type"
                value={fileType}
                onChange={(e) => setFileType(e.target.value)}
                placeholder="pdf / ppt / doc"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="res-size">文件大小</Label>
              <Input
                id="res-size"
                value={fileSize}
                onChange={(e) => setFileSize(e.target.value)}
                placeholder="例如：2.5 MB"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="res-featured"
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="res-featured" className="cursor-pointer text-sm">
              设为精选资源
            </Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleClose(false)}>
              取消
            </Button>
            <Button type="submit" disabled={isLoading || !title.trim()}>
              {isLoading ? "添加中..." : "添加资源"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
