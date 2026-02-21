import { createFileRoute } from "@tanstack/react-router";
import { PublicCourseDetailPage } from "@/pages/public/course-detail";

export const Route = createFileRoute("/(app)/courses/$courseId")({
  component: function PublicCourseDetailRoute() {
    const { courseId } = Route.useParams();
    return <PublicCourseDetailPage courseId={courseId} />;
  },
});
