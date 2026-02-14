import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
} from "@course-manager/ui";
import {
  ArrowLeft,
  Clock,
  User,
  MapPin,
  Calendar,
  BookOpen,
} from "lucide-react";
import { useCourseDetail } from "@/hooks/use-queries";

export const Route = createFileRoute("/courses/$courseId")({
  component: PublicCourseDetail,
});

function PublicCourseDetail() {
  const { courseId } = Route.useParams();
  const navigate = useNavigate();
  const { data: course, isLoading } = useCourseDetail(courseId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-gray-500">课程不存在</p>
        <Button className="mt-4" variant="outline" onClick={() => navigate({ to: "/courses" })}>
          返回课程列表
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6 md:p-10">
      <Button
        variant="ghost"
        className="gap-2"
        onClick={() => navigate({ to: "/courses" })}
      >
        <ArrowLeft className="h-4 w-4" />
        返回课程列表
      </Button>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {course.category && (
                <Badge variant="outline" className="mb-3">
                  {course.category}
                </Badge>
              )}
              <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
            </div>
            {course.price > 0 ? (
              <div className="text-2xl font-bold text-blue-600">
                ¥{Number(course.price).toFixed(2)}
              </div>
            ) : (
              <Badge className="bg-green-50 text-green-700 border-green-200" variant="outline">
                免费
              </Badge>
            )}
          </div>

          <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              {course.teacher_name}
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4" />
              {course.schedules?.length || 0} 节课
            </span>
          </div>

          {course.description && (
            <div className="mt-6">
              <h2 className="text-sm font-semibold text-gray-900">课程简介</h2>
              <p className="mt-2 whitespace-pre-line text-sm text-gray-600">
                {course.description}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {course.schedules && course.schedules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              课程日程
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {course.schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="flex items-center gap-4 rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">
                    {schedule.lesson_number}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">
                      {schedule.title || `第 ${schedule.lesson_number} 课`}
                    </h4>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(schedule.start_time).toLocaleString("zh-CN")} -{" "}
                        {new Date(schedule.end_time).toLocaleTimeString("zh-CN")}
                      </span>
                      {schedule.room && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {schedule.room}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
