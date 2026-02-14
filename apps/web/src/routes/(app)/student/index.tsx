import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Button, Card, CardContent, Input, Badge } from "@course-manager/ui";
import { Search, BookOpen, Clock, User } from "lucide-react";
import { useStudentCourses } from "@/hooks/use-queries";
import type { Course } from "@/api/client";
import { EmptyState } from "@/components/empty-state";

export const Route = createFileRoute("/(app)/student/")({
  component: StudentCourseBrowse,
});

const categories = ["全部", "数学", "物理", "化学", "英语", "计算机", "其他"];

function StudentCourseBrowse() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const { data: courses = [], isLoading } = useStudentCourses();

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (course.description || "").toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "全部" || course.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [courses, searchQuery, selectedCategory]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">课程浏览</h1>
        <p className="mt-1 text-sm text-gray-500">
          浏览所有可选课程，共 {courses.length} 门课程
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="搜索课程..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Course List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">加载中...</div>
        </div>
      ) : filteredCourses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="没有找到课程"
          description="尝试调整搜索或筛选条件"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredCourses.map((course) => (
            <StudentCourseCard
              key={course.id}
              course={course}
              onClick={() => navigate({ to: `/student/courses/${course.id}` })}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function StudentCourseCard({
  course,
  onClick,
}: {
  course: Course;
  onClick: () => void;
}) {
  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-900">{course.title}</h3>
            {course.description && (
              <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                {course.description}
              </p>
            )}
          </div>
          {course.category && (
            <Badge variant="outline" className="ml-2 shrink-0">
              {course.category}
            </Badge>
          )}
        </div>

        <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <User className="h-3.5 w-3.5" />
            {course.teacher_name}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {course.lesson_count} 节课
          </span>
        </div>

        {course.price > 0 ? (
          <div className="mt-3 text-lg font-bold text-blue-600">
            ¥{Number(course.price).toFixed(2)}
          </div>
        ) : (
          <div className="mt-3 text-sm font-medium text-green-600">免费</div>
        )}
      </CardContent>
    </Card>
  );
}
