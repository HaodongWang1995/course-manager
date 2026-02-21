import { AlertCircle, CheckCircle, XCircle, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@course-manager/ui";

export interface EnrollmentCTAProps {
  courseId: string;
  isLoggedIn: boolean;
  isStudent: boolean;
  isUserLoading: boolean;
  enrollment?: { status: string; reject_reason?: string };
  note: string;
  onNoteChange: (v: string) => void;
  onApply: () => void;
  applying: boolean;
  error?: string;
  onLogin: () => void;
}

export function EnrollmentCTA({
  isLoggedIn,
  isStudent,
  isUserLoading,
  enrollment,
  note,
  onNoteChange,
  onApply,
  applying,
  error,
  onLogin,
}: EnrollmentCTAProps) {
  const { t } = useTranslation("publicCourseDetail");

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-500">{t("enrollment.loginPrompt")}</p>
        <Button onClick={onLogin} className="shrink-0">
          {t("enrollment.loginButton")}
        </Button>
      </div>
    );
  }

  if (isUserLoading) {
    return <div className="h-10 animate-pulse rounded-md bg-gray-100" />;
  }

  if (!isStudent) {
    return null;
  }

  if (!enrollment) {
    return (
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          {t("enrollment.applyNote")}
        </label>
        <textarea
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder={t("enrollment.applyNotePlaceholder")}
          rows={2}
          className="w-full resize-none rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {error && (
          <p className="flex items-center gap-1 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            {error}
          </p>
        )}
        <Button onClick={onApply} disabled={applying} className="w-full">
          {applying ? t("enrollment.applying") : t("enrollment.applyButton")}
        </Button>
      </div>
    );
  }

  if (enrollment.status === "pending") {
    return (
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-amber-500" />
        <div>
          <p className="text-sm font-medium text-amber-600">
            {t("enrollment.pendingTitle")}
          </p>
          <p className="text-xs text-amber-500">{t("enrollment.pendingDesc")}</p>
        </div>
      </div>
    );
  }

  if (enrollment.status === "approved") {
    return (
      <div className="flex items-center gap-2">
        <CheckCircle className="h-5 w-5 text-emerald-500" />
        <div>
          <p className="text-sm font-medium text-emerald-600">
            {t("enrollment.approvedTitle")}
          </p>
          <p className="text-xs text-emerald-500">{t("enrollment.approvedDesc")}</p>
        </div>
      </div>
    );
  }

  if (enrollment.status === "rejected") {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <XCircle className="h-5 w-5 text-red-500" />
          <div>
            <p className="text-sm font-medium text-red-600">
              {t("enrollment.rejectedTitle")}
            </p>
            {enrollment.reject_reason && (
              <p className="text-xs text-red-500">
                {t("enrollment.rejectedReason", { reason: enrollment.reject_reason })}
              </p>
            )}
          </div>
        </div>
        <textarea
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder={t("enrollment.applyNotePlaceholder")}
          rows={2}
          className="w-full resize-none rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <Button
          onClick={onApply}
          disabled={applying}
          variant="outline"
          className="w-full"
        >
          {applying ? t("enrollment.reapplying") : t("enrollment.reapplyButton")}
        </Button>
      </div>
    );
  }

  return null;
}
