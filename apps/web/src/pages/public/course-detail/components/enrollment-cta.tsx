import { AlertCircle, CheckCircle, XCircle, Clock } from "lucide-react";
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
  if (!isLoggedIn) {
    return (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-500">登录后即可申请选课</p>
        <Button onClick={onLogin} className="shrink-0">
          登录后申请选课
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
        <textarea
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder="申请备注（可选）"
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
          {applying ? "提交中..." : "申请选课"}
        </Button>
      </div>
    );
  }

  if (enrollment.status === "pending") {
    return (
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-amber-500" />
        <span className="text-sm font-medium text-amber-600">
          选课申请已提交，等待教师审核
        </span>
      </div>
    );
  }

  if (enrollment.status === "approved") {
    return (
      <div className="flex items-center gap-2">
        <CheckCircle className="h-5 w-5 text-emerald-500" />
        <span className="text-sm font-medium text-emerald-600">
          已选课，祝学习顺利！
        </span>
      </div>
    );
  }

  if (enrollment.status === "rejected") {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <XCircle className="h-5 w-5 text-red-500" />
          <span className="text-sm font-medium text-red-600">
            申请未通过
            {enrollment.reject_reason ? `：${enrollment.reject_reason}` : ""}
          </span>
        </div>
        <textarea
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder="重新申请备注（可选）"
          rows={2}
          className="w-full resize-none rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <Button
          onClick={onApply}
          disabled={applying}
          variant="outline"
          className="w-full"
        >
          {applying ? "提交中..." : "重新申请"}
        </Button>
      </div>
    );
  }

  return null;
}
