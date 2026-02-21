import { createFileRoute } from "@tanstack/react-router";
import { StudentCourseDetailPage } from "@/pages/student/course-detail";

export const Route = createFileRoute("/(app)/student/courses/$courseId")({
  component: function StudentCourseDetailRoute() {
    const { courseId } = Route.useParams();
    return <StudentCourseDetailPage courseId={courseId} />;
  },
});
