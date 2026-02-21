import { FileText, FileSpreadsheet, Download, Trash2 } from "lucide-react";
import { cn } from "../lib/utils";

export interface AttachmentItem {
  id: string;
  filename: string;
  file_type?: string;
  file_size?: number;
  download_url?: string;
  created_at: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileIcon({ fileType }: { fileType?: string }) {
  const type = (fileType || "").toLowerCase();
  if (type.includes("pdf")) {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-red-100">
        <FileText className="h-4 w-4 text-red-600" />
      </div>
    );
  }
  if (type.includes("doc")) {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-100">
        <FileText className="h-4 w-4 text-blue-600" />
      </div>
    );
  }
  if (type.includes("sheet") || type.includes("excel") || type.includes("xls")) {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-green-100">
        <FileSpreadsheet className="h-4 w-4 text-green-600" />
      </div>
    );
  }
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gray-100">
      <FileText className="h-4 w-4 text-gray-500" />
    </div>
  );
}

export interface AttachmentListProps {
  attachments: AttachmentItem[];
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
  className?: string;
  emptyText?: string;
}

export function AttachmentList({
  attachments,
  onDelete,
  isDeleting,
  className,
  emptyText = "No attachments yet",
}: AttachmentListProps) {
  if (attachments.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-gray-400">{emptyText}</p>
    );
  }

  return (
    <div className={cn("divide-y divide-gray-100 rounded-lg border border-gray-200", className)}>
      {attachments.map((attachment) => (
        <div key={attachment.id} className="flex items-center gap-3 px-4 py-3">
          <FileIcon fileType={attachment.file_type} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900">
              {attachment.filename}
            </p>
            {attachment.file_size != null && (
              <p className="text-xs text-gray-400">{formatBytes(attachment.file_size)}</p>
            )}
          </div>
          <div className="flex items-center gap-1">
            {attachment.download_url && !attachment.download_url.startsWith("stub://") && (
              <a
                href={attachment.download_url}
                target="_blank"
                rel="noopener noreferrer"
                download={attachment.filename}
                className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <Download className="h-4 w-4" />
              </a>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(attachment.id)}
                disabled={isDeleting}
                className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
