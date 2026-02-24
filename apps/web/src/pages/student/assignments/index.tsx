import {
  Card,
  CardContent,
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  FileUploadZone,
} from "@course-manager/ui";
import {
  Search,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Upload,
  Paperclip,
  ChevronRight,
  X,
} from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useStudentAssignments, useUpdateAssignmentStatus } from "@/hooks/use-queries";
import { assignmentApi, getToken } from "@/api/client";
import type { StudentAssignment } from "@/api/client";

export function StudentAssignmentsPage() {
  const { t } = useTranslation("studentAssignments");
  const { data: assignments = [] } = useStudentAssignments();
  const updateStatus = useUpdateAssignmentStatus();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  // Submit dialog state
  const [submitTarget, setSubmitTarget] = useState<StudentAssignment | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const filtered = useMemo(() => {
    return assignments.filter((a) => {
      const st = a.submission_status || "";
      const course = a.course_title || "";
      const matchesSearch = !searchQuery ||
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter =
        activeFilter === "All" ||
        (activeFilter === "To Do" && st === "pending") ||
        (activeFilter === "Submitted" && st === "submitted") ||
        (activeFilter === "Late" && st === "late");
      return matchesSearch && matchesFilter;
    });
  }, [assignments, searchQuery, activeFilter]);

  const pendingCount = assignments.filter((a) => a.submission_status === "pending").length;

  const filterTabs = [
    { key: "All", label: t("filters.all"), count: null },
    { key: "To Do", label: t("filters.todo"), count: pendingCount || null },
    { key: "Submitted", label: t("filters.submitted"), count: null },
    { key: "Late", label: t("filters.late"), count: null },
  ];

  const openSubmitDialog = useCallback((assignment: StudentAssignment) => {
    setSubmitTarget(assignment);
    setSelectedFile(null);
    setUploading(false);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!submitTarget) return;
    setUploading(true);

    try {
      const isLate = new Date(submitTarget.due_date) < new Date();
      const status = isLate ? "late" : "submitted";

      let fileKey: string | undefined;
      let fileName: string | undefined;
      let fileSize: number | undefined;
      let fileType: string | undefined;

      // If file is selected, upload it first
      if (selectedFile) {
        // Step 1: Presign
        const { upload_url, file_key } = await assignmentApi.presignSubmission(
          submitTarget.id,
          {
            filename: selectedFile.name,
            content_type: selectedFile.type || "application/octet-stream",
            file_size: selectedFile.size,
          },
        );

        // Step 2: Upload
        if (upload_url.startsWith("/api/")) {
          // Local/stub mode
          const formData = new FormData();
          formData.append("file", selectedFile);
          const resp = await fetch(upload_url, {
            method: "POST",
            headers: { Authorization: `Bearer ${getToken()}` },
            body: formData,
          });
          if (!resp.ok) throw new Error(`Upload failed: ${resp.status}`);
        } else {
          // R2 mode
          await new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open("PUT", upload_url);
            xhr.setRequestHeader("Content-Type", selectedFile.type || "application/octet-stream");
            xhr.onload = () =>
              xhr.status < 300 ? resolve() : reject(new Error(`Upload failed: ${xhr.status}`));
            xhr.onerror = () => reject(new Error("Upload network error"));
            xhr.send(selectedFile);
          });
        }

        fileKey = file_key;
        fileName = selectedFile.name;
        fileSize = selectedFile.size;
        fileType = selectedFile.type || undefined;
      }

      // Step 3: Submit
      updateStatus.mutate(
        {
          id: submitTarget.id,
          status,
          file_key: fileKey,
          filename: fileName,
          file_size: fileSize,
          file_type: fileType,
        },
        {
          onSuccess: () => {
            setSubmitTarget(null);
            setSelectedFile(null);
            setUploading(false);
          },
          onError: () => {
            setUploading(false);
          },
        },
      );
    } catch {
      setUploading(false);
    }
  }, [submitTarget, selectedFile, updateStatus]);

  const getStatusBadge = (status: string) => {
    if (status === "submitted") {
      return <Badge variant="success" className="text-[10px]">{t("status.submitted")}</Badge>;
    }
    if (status === "late") {
      return <Badge variant="destructive" className="text-[10px]">{t("status.late")}</Badge>;
    }
    if (status === "graded") {
      return <Badge variant="default" className="bg-purple-100 text-purple-700 border-none text-[10px]">{t("status.graded")}</Badge>;
    }
    return null;
  };

  const urgentAssignment = assignments.find(
    (a) => a.submission_status === "pending" && new Date(a.due_date) > new Date(),
  );

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder={t("searchPlaceholder")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              activeFilter === tab.key
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {tab.label}
            {tab.count && (
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                  activeFilter === tab.key ? "bg-white/20 text-white" : "bg-red-100 text-red-600"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Priority Hero - Due Soon */}
      {urgentAssignment && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-700 via-indigo-700 to-violet-800 p-5 shadow-lg">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.08)_0%,transparent_60%)]" />
          <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-red-500 px-2.5 py-1 shadow-sm">
            <AlertTriangle className="h-3 w-3 text-white" />
            <span className="text-[11px] font-bold text-white">
              {t("dueSoon")}
            </span>
          </div>
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-200">
            {urgentAssignment.course_title}
          </p>
          <h3 className="mt-1.5 text-xl font-bold leading-snug text-white pr-28">
            {urgentAssignment.title}
          </h3>
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-blue-200">
            <Clock className="h-3.5 w-3.5" />
            <span>{t("priority")}</span>
          </div>
          <button
            onClick={() => openSubmitDialog(urgentAssignment)}
            className="mt-4 flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-indigo-700 shadow-md transition-all hover:bg-blue-50 active:scale-[0.98]"
          >
            <Upload className="h-4 w-4" />
            {t("submitNow")}
          </button>
        </div>
      )}

      {/* Assignment List */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">{t("thisWeek")}</h2>
          <ChevronRight className="h-4 w-4 text-gray-400" />
        </div>

        <div className="space-y-3">
          {filtered.map((assignment) => {
            const st = assignment.submission_status || "pending";
            const isSubmitted = st === "submitted" || st === "graded";
            const courseTitle = assignment.course_title || "";

            return (
              <Card key={assignment.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-10 w-1 shrink-0 rounded-full bg-blue-500" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-gray-500">{courseTitle}</span>
                        {getStatusBadge(st)}
                      </div>
                      <h3 className="mt-1 text-sm font-semibold text-gray-900">{assignment.title}</h3>
                      {assignment.description && (
                        <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                          {assignment.description}
                        </p>
                      )}
                      <div className="mt-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(assignment.due_date).toLocaleDateString()}</span>
                          </div>
                          {assignment.submitted_at && (
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <Paperclip className="h-3 w-3" />
                              <span>{t("status.submitted")}</span>
                            </div>
                          )}
                        </div>
                        {!isSubmitted && st !== "late" && (
                          <button
                            onClick={() => openSubmitDialog(assignment)}
                            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            {t("actions.submit")}
                          </button>
                        )}
                        {st === "late" && (
                          <button
                            onClick={() => openSubmitDialog(assignment)}
                            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 transition-colors"
                          >
                            {t("actions.submitLate")}
                          </button>
                        )}
                        {isSubmitted && (
                          <div className="flex items-center gap-1 text-xs font-medium text-green-600">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>{t("status.submitted")}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-gray-400">{t("empty")}</p>
          )}
        </div>
      </section>

      {/* Submit Dialog */}
      <Dialog open={!!submitTarget} onOpenChange={(open) => { if (!open) setSubmitTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("submitDialog.title")}</DialogTitle>
            <DialogDescription>
              {submitTarget?.title} — {submitTarget?.course_title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* File upload area */}
            {selectedFile ? (
              <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-3">
                <Paperclip className="h-5 w-5 shrink-0 text-gray-400" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-xs text-gray-400">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="rounded-full p-1 hover:bg-gray-100"
                >
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            ) : (
              <FileUploadZone
                onFileSelect={(files) => setSelectedFile(files[0])}
                uploading={uploading}
                maxSizeMB={50}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.mp4,.zip"
                uploadPromptText={t("submitDialog.uploadPrompt")}
                maxSizeText={t("submitDialog.maxSize")}
                uploadingText={t("submitDialog.uploading")}
                tooLargeText={t("submitDialog.tooLarge")}
              />
            )}

            <p className="text-xs text-gray-400">{t("submitDialog.fileOptional")}</p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSubmitTarget(null)} disabled={uploading}>
              {t("submitDialog.cancel")}
            </Button>
            <Button onClick={handleSubmit} disabled={uploading}>
              {uploading ? t("submitDialog.submitting") : t("submitDialog.submit")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
