import { useParams } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useTeacherStudentDetail } from "@/hooks/use-queries";
import { ProfileHeader } from "./components/profile-header";
import { PerformanceOverview } from "./components/performance-overview";
import { EnrolledCourses } from "./components/enrolled-courses";
import { PrivateNotes } from "./components/private-notes";
import { RecentSubmissions } from "./components/recent-submissions";

export function StudentDetailPage() {
  const { studentId } = useParams({ strict: false }) as { studentId: string };
  const { t } = useTranslation("studentDetail");
  const { data: student, isLoading } = useTeacherStudentDetail(studentId);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-slate-500">{t("loading")}</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-slate-500">{t("notFound")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <ProfileHeader student={student} />

      {/* H5 Layout: single column */}
      <div className="space-y-4 p-4 lg:hidden">
        <PerformanceOverview />
        <EnrolledCourses enrollments={student.enrollments} />
        <PrivateNotes />
        <RecentSubmissions />
      </div>

      {/* PC Layout: two columns */}
      <div className="hidden lg:block">
        <div className="mx-auto max-w-7xl px-8 py-8">
          <div className="grid grid-cols-3 gap-8">
            {/* Left column: 2/3 */}
            <div className="col-span-2 space-y-8">
              <PerformanceOverview />
              <RecentSubmissions />
            </div>
            {/* Right column: 1/3 */}
            <div className="space-y-8">
              <EnrolledCourses enrollments={student.enrollments} />
              <PrivateNotes />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
