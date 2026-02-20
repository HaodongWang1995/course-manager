import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Card,
  CardContent,
  Badge,
  Button,
} from "@course-manager/ui";
import { Clock, CheckCircle, XCircle, Trash2, ClipboardList, Search } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { useState } from "react";
import { useMyEnrollments, useCancelEnrollment } from "@/hooks/use-queries";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/(app)/student/enrollments")({
  component: StudentEnrollments,
});

function StudentEnrollments() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState("");
  const { data: enrollments = [], isLoading } = useMyEnrollments(
    statusFilter ? { status: statusFilter } : undefined
  );
  const cancelMutation = useCancelEnrollment();

  const statusTabs = [
    { label: t("enrollments.filter.all"), value: "" },
    { label: t("enrollments.filter.pending"), value: "pending" },
    { label: t("enrollments.filter.approved"), value: "approved" },
    { label: t("enrollments.filter.rejected"), value: "rejected" },
  ];

  const statusConfig = {
    pending: {
      label: t("enrollments.status.pending"),
      variant: "secondary" as const,
      icon: Clock,
      color: "text-amber-600",
    },
    approved: {
      label: t("enrollments.status.approved"),
      variant: "default" as const,
      icon: CheckCircle,
      color: "text-emerald-600",
    },
    rejected: {
      label: t("enrollments.status.rejected"),
      variant: "destructive" as const,
      icon: XCircle,
      color: "text-red-600",
    },
  };

  const handleCancel = (id: string) => {
    if (window.confirm("确定要取消这个报名吗？")) {
      cancelMutation.mutate(id);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("enrollments.title")}</h1>
          <p className="mt-1 text-sm text-gray-500">{t("enrollments.subtitle")}</p>
        </div>
        <Button
          variant="outline"
          className="shrink-0 gap-2"
          onClick={() => navigate({ to: "/courses" })}
        >
          <Search className="h-4 w-4" />
          {t("enrollments.browseAll")}
        </Button>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              statusFilter === tab.value
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Enrollment List */}
      {isLoading ? (
        <div className="py-12 text-center text-gray-500">{t("enrollments.loading")}</div>
      ) : enrollments.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={t("enrollments.empty.title")}
          description={t("enrollments.empty.description")}
          action={
            <Button onClick={() => navigate({ to: "/courses" })} className="gap-2">
              <Search className="h-4 w-4" />
              {t("enrollments.browseAll")}
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {enrollments.map((enrollment) => {
            const config = statusConfig[enrollment.status];
            const StatusIcon = config.icon;

            return (
              <Card key={enrollment.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {enrollment.course_title}
                      </h3>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {t("enrollments.teacher")}{enrollment.teacher_name}
                      </p>
                      {enrollment.note && (
                        <p className="mt-1 text-xs text-gray-400">
                          {t("enrollments.note")}{enrollment.note}
                        </p>
                      )}
                      {enrollment.reject_reason && (
                        <p className="mt-1 text-xs text-red-500">
                          {t("enrollments.reason")}{enrollment.reject_reason}
                        </p>
                      )}
                      <p className="mt-2 text-xs text-gray-400">
                        {t("enrollments.applied")}{new Date(enrollment.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="ml-4 flex shrink-0 items-center gap-2">
                      <Badge variant={config.variant} className="gap-1">
                        <StatusIcon className="h-3 w-3" />
                        {config.label}
                      </Badge>
                      {enrollment.status === "pending" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancel(enrollment.id)}
                          disabled={cancelMutation.isPending}
                          className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
