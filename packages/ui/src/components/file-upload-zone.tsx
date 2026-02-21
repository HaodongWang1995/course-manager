"use client";

import { useRef, useState, type DragEvent, type ChangeEvent } from "react";
import { Upload, X } from "lucide-react";
import { cn } from "../lib/utils";

export interface FileUploadZoneProps {
  onFileSelect: (files: File[]) => void;
  uploading?: boolean;
  accept?: string;
  maxSizeMB?: number;
  multiple?: boolean;
  className?: string;
  disabled?: boolean;
  uploadPromptText?: string;
  maxSizeText?: string;
  uploadingText?: string;
  tooLargeText?: string;
}

export function FileUploadZone({
  onFileSelect,
  uploading = false,
  accept,
  maxSizeMB = 50,
  multiple = false,
  className,
  disabled = false,
  uploadPromptText = "Drag & drop or click to upload",
  maxSizeText,
  uploadingText = "Uploading...",
  tooLargeText,
}: FileUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateAndSelect = (files: File[]) => {
    setError(null);
    const maxBytes = maxSizeMB * 1024 * 1024;
    const oversized = files.filter((f) => f.size > maxBytes);
    if (oversized.length > 0) {
      setError(tooLargeText ?? `File too large. Max ${maxSizeMB}MB per file.`);
      return;
    }
    onFileSelect(files);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || uploading) return;
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) validateAndSelect(multiple ? files : [files[0]]);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) validateAndSelect(files);
    e.target.value = "";
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && !uploading && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !disabled && !uploading) {
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors",
          isDragging && !disabled
            ? "border-blue-400 bg-blue-50"
            : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100",
          disabled && "cursor-not-allowed opacity-50",
          uploading && "cursor-wait opacity-75",
        )}
      >
        <Upload
          className={cn("h-8 w-8", isDragging ? "text-blue-500" : "text-gray-400")}
        />
        {uploading ? (
          <p className="text-sm text-gray-500">{uploadingText}</p>
        ) : (
          <>
            <p className="text-sm font-medium text-gray-700">
              {uploadPromptText}
            </p>
            <p className="text-xs text-gray-400">
              {maxSizeText ?? `Max ${maxSizeMB}MB per file`}
            </p>
          </>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-1.5 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">
          <X className="h-3.5 w-3.5 shrink-0" />
          {error}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={handleChange}
        disabled={disabled || uploading}
      />
    </div>
  );
}
