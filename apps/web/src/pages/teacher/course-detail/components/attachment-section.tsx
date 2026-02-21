import { Card, CardContent, CardHeader, CardTitle, FileUploadZone, AttachmentList } from "@course-manager/ui";
import { Paperclip } from "lucide-react";
import type { Attachment } from "@/api/client";
import { useTranslation } from "react-i18next";

interface AttachmentSectionProps {
  attachments: Attachment[];
  onFileSelect: (files: File[]) => void;
  uploading: boolean;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  uploadPromptText: string;
  maxSizeText: string;
  uploadingText: string;
  tooLargeText: string;
  emptyText: string;
}

export function AttachmentSection({
  attachments,
  onFileSelect,
  uploading,
  onDelete,
  isDeleting,
  uploadPromptText,
  maxSizeText,
  uploadingText,
  tooLargeText,
  emptyText,
}: AttachmentSectionProps) {
  const { t } = useTranslation("teacherCourseDetail");
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <Paperclip className="h-5 w-5 text-gray-500" />
        <CardTitle>{t("attachment.title")} ({attachments.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FileUploadZone
          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.mp4,.zip"
          maxSizeMB={50}
          uploading={uploading}
          uploadPromptText={uploadPromptText}
          maxSizeText={maxSizeText}
          uploadingText={uploadingText}
          tooLargeText={tooLargeText}
          onFileSelect={onFileSelect}
        />
        <AttachmentList
          attachments={attachments}
          onDelete={onDelete}
          isDeleting={isDeleting}
          emptyText={emptyText}
        />
      </CardContent>
    </Card>
  );
}
