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
  const { t } = useTranslation("teacherCourseDetail");
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
          <DialogTitle>{t("addResource.title")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="res-title">{t("addResource.fields.title")}</Label>
            <Input
              id="res-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("addResource.placeholders.title")}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="res-type">{t("addResource.fields.fileType")}</Label>
              <Input
                id="res-type"
                value={fileType}
                onChange={(e) => setFileType(e.target.value)}
                placeholder={t("addResource.placeholders.fileType")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="res-size">{t("addResource.fields.fileSize")}</Label>
              <Input
                id="res-size"
                value={fileSize}
                onChange={(e) => setFileSize(e.target.value)}
                placeholder={t("addResource.placeholders.fileSize")}
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
              {t("addResource.fields.featured")}
            </Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleClose(false)}>
              {t("addResource.cancel")}
            </Button>
            <Button type="submit" disabled={isLoading || !title.trim()}>
              {isLoading ? t("addResource.submitting") : t("addResource.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
