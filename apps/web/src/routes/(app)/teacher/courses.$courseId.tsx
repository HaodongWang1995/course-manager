import { createFileRoute } from "@tanstack/react-router";
import { TeacherCourseDetailPage } from "@/pages/teacher/course-detail";

export const Route = createFileRoute("/(app)/teacher/courses/$courseId")({
  component: function TeacherCourseDetailRoute() {
    const { courseId } = Route.useParams();
    return <TeacherCourseDetailPage courseId={courseId} />;
  },
});
