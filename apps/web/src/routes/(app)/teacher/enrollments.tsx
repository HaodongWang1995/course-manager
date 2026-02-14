import { createFileRoute } from "@tanstack/react-router";
import {
  Card,
  CardContent,
  Badge,
  Button,
  Avatar,
  AvatarFallback,
} from "@course-manager/ui";
import { CheckCircle, XCircle, Clock, Users, ClipboardList } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { useState } from "react";
import {
  useTeacherCourses,
  useCourseEnrollments,
  useReviewEnrollment,
} from "@/hooks/use-queries";

export const Route = createFileRoute("/(app)/teacher/enrollments")({
  component: TeacherEnrollments,
});

const statusConfig = {
  pending: { label: "Pending", variant: "secondary" as const, icon: Clock },
  approved: { label: "Approved", variant: "default" as const, icon: CheckCircle },
  rejected: { label: "Rejected", variant: "destructive" as const, icon: XCircle },
};

function TeacherEnrollments() {
  const { data: courses = [] } = useTeacherCourses();
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const courseId = selectedCourseId || (courses.length > 0 ? courses[0].id : "");

  const { data: enrollments = [], isLoading } = useCourseEnrollments(
    courseId,
    statusFilter ? { status: statusFilter } : undefined
  );
  const reviewMutation = useReviewEnrollment();

  const handleApprove = (id: string) => {
    reviewMutation.mutate({ id, data: { status: "approved" } });
  };

  const handleReject = (id: string) => {
    reviewMutation.mutate(
      { id, data: { status: "rejected", reject_reason: rejectReason || undefined } },
      { onSuccess: () => { setRejectingId(null); setRejectReason(""); } }
    );
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Enrollment Management
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          <Users className="mr-1 inline-block h-4 w-4" />
          Review and manage student enrollment applications
        </p>
      </div>

      {/* Course Selector + Status Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <select
          value={courseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          {[
            { label: "All", value: "" },
            { label: "Pending", value: "pending" },
            { label: "Approved", value: "approved" },
            { label: "Rejected", value: "rejected" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                statusFilter === tab.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Enrollment List */}
      {!courseId ? (
        <EmptyState
          icon={ClipboardList}
          title="No courses found"
          description="Create a course first to manage enrollments"
        />
      ) : isLoading ? (
        <div className="py-12 text-center text-gray-500">Loading...</div>
      ) : enrollments.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No enrollment applications"
          description="No enrollment applications for this course"
        />
      ) : (
        <div className="space-y-3">
          {enrollments.map((enrollment) => {
            const config = statusConfig[enrollment.status];
            const StatusIcon = config.icon;
            const initials = (enrollment.student_name || "?")
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase();

            return (
              <Card key={enrollment.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback className="bg-blue-500 text-xs font-medium text-white">
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-gray-900">
                          {enrollment.student_name}
                        </h3>
                        <Badge variant={config.variant} className="gap-1">
                          <StatusIcon className="h-3 w-3" />
                          {config.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500">
                        {enrollment.student_email}
                      </p>
                      {enrollment.note && (
                        <p className="mt-1 text-sm text-gray-600">
                          "{enrollment.note}"
                        </p>
                      )}
                      <p className="mt-1 text-xs text-gray-400">
                        Applied: {new Date(enrollment.created_at).toLocaleDateString()}
                      </p>

                      {/* Reject reason input */}
                      {rejectingId === enrollment.id && (
                        <div className="mt-2 flex gap-2">
                          <input
                            type="text"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Reason for rejection (optional)"
                            className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(enrollment.id)}
                            disabled={reviewMutation.isPending}
                          >
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => { setRejectingId(null); setRejectReason(""); }}
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    {enrollment.status === "pending" && rejectingId !== enrollment.id && (
                      <div className="flex shrink-0 gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(enrollment.id)}
                          disabled={reviewMutation.isPending}
                          className="gap-1 bg-emerald-600 hover:bg-emerald-700"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setRejectingId(enrollment.id)}
                          className="gap-1 text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Reject
                        </Button>
                      </div>
                    )}
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
