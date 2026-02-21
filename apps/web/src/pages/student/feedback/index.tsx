import { Link } from "@tanstack/react-router";
import { Card, CardContent } from "@course-manager/ui";
import { ArrowLeft } from "lucide-react";
import { useCourseFeedbackDetail, useCourseResources } from "@/hooks/use-queries";
import { FeedbackDisplay } from "./components/feedback-display";

interface StudentFeedbackPageProps {
  courseId: string;
}

export function StudentFeedbackPage({ courseId }: StudentFeedbackPageProps) {
  const { data: feedback, isLoading } = useCourseFeedbackDetail(courseId);
  const { data: resources = [] } = useCourseResources(courseId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-gray-500">Loading feedback...</p>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="mx-auto max-w-lg space-y-5 pb-24">
        <div className="flex items-center gap-3">
          <Link
            to="/student"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-gray-600" />
          </Link>
          <h1 className="text-lg font-bold text-gray-900">Feedback Detail</h1>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-sm text-gray-500">No feedback available for this course yet.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-5 pb-24">
      {/* Top Navigation Bar */}
      <div className="flex items-center gap-3">
        <a
          href="/student"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-gray-600" />
        </a>
        <h1 className="text-lg font-bold text-gray-900">Feedback Detail</h1>
      </div>

      <FeedbackDisplay feedback={feedback} resources={resources} />
    </div>
  );
}
