import { createFileRoute } from "@tanstack/react-router";
import { FeedbackEditorPage } from "@/pages/teacher/feedback";

export const Route = createFileRoute("/(app)/teacher/feedback/$courseId")({
  component: function FeedbackEditorRoute() {
    const { courseId } = Route.useParams();
    return <FeedbackEditorPage courseId={courseId} />;
  },
});
