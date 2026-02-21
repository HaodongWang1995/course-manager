import { createFileRoute } from "@tanstack/react-router";
import { StudentFeedbackPage } from "@/pages/student/feedback";

export const Route = createFileRoute("/(app)/student/feedback/$courseId")({
  component: function StudentFeedbackRoute() {
    const { courseId } = Route.useParams();
    return <StudentFeedbackPage courseId={courseId} />;
  },
});
