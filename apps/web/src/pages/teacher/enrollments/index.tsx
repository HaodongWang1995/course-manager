import { useState } from "react";
import { Users, ClipboardList } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import {
  useTeacherCourses,
  useCourseEnrollments,
  useReviewEnrollment,
} from "@/hooks/use-queries";
import { EnrollmentCard } from "./components/enrollment-card";
import { StatusFilter } from "./components/status-filter";

export function TeacherEnrollmentsPage() {
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

  const handleConfirmReject = (id: string) => {
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

        <StatusFilter statusFilter={statusFilter} onStatusChange={setStatusFilter} />
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
          {enrollments.map((enrollment) => (
            <EnrollmentCard
              key={enrollment.id}
              enrollment={enrollment}
              rejectingId={rejectingId}
              rejectReason={rejectReason}
              isPending={reviewMutation.isPending}
              onApprove={handleApprove}
              onStartReject={setRejectingId}
              onConfirmReject={handleConfirmReject}
              onCancelReject={() => { setRejectingId(null); setRejectReason(""); }}
              onRejectReasonChange={setRejectReason}
            />
          ))}
        </div>
      )}
    </div>
  );
}
