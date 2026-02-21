import { useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Button, Card, CardContent, Input, Badge } from "@course-manager/ui";
import { Search, BookOpen, Clock, User } from "lucide-react";
import { useStudentCourses } from "@/hooks/use-queries";
import type { Course } from "@/api/client";
import { EmptyState } from "@/components/empty-state";

type CategoryKey = "all" | "math" | "physics" | "chemistry" | "english" | "computer" | "other";

const CATEGORY_KEYS: CategoryKey[] = ["all", "math", "physics", "chemistry", "english", "computer", "other"];

const CATEGORY_VALUES: Record<CategoryKey, string> = {
  all: "全部",
  math: "数学",
  physics: "物理",
  chemistry: "化学",
  english: "英语",
  computer: "计算机",
  other: "其他",
};

function PublicCourseCard({
  course,
  onClick,
}: {
  course: Course;
  onClick: () => void;
}) {
  const { t } = useTranslation("publicCourses");

  return (
    <Card className="cursor-pointer transition-shadow hover:shadow-md" onClick={onClick}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-900">{course.title}</h3>
            {course.description && (
              <p className="mt-1 line-clamp-2 text-sm text-gray-500">{course.description}</p>
            )}
          </div>
          {course.category && (
            <Badge variant="outline" className="ml-2 shrink-0">{course.category}</Badge>
          )}
        </div>

        <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <User className="h-3.5 w-3.5" />
            {t("card.teacher", { name: course.teacher_name })}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {t("card.lessons", { count: course.lesson_count })}
          </span>
        </div>

        {course.price > 0 ? (
          <div className="mt-3 text-lg font-bold text-blue-600">
            ¥{Number(course.price).toFixed(2)}
          </div>
        ) : (
          <div className="mt-3 text-sm font-medium text-green-600">{t("card.free")}</div>
        )}
      </CardContent>
    </Card>
  );
}

export function PublicCourseBrowsePage() {
  const navigate = useNavigate();
  const { t } = useTranslation("publicCourses");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<CategoryKey>("all");
  const { data: courses = [], isLoading } = useStudentCourses();

  const selectedCategoryValue = CATEGORY_VALUES[selectedCategoryKey];

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (course.description || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategoryKey === "all" || course.category === selectedCategoryValue;
      return matchesSearch && matchesCategory;
    });
  }, [courses, searchQuery, selectedCategoryKey, selectedCategoryValue]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6 md:p-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {t("subtitle")}
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder={t("searchPlaceholder")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORY_KEYS.map((key) => (
          <Button
            key={key}
            variant={selectedCategoryKey === key ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategoryKey(key)}
          >
            {t(`categories.${key}`)}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">{t("loading")}</div>
        </div>
      ) : filteredCourses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={t("empty.title")}
          description={t("empty.description")}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <PublicCourseCard
              key={course.id}
              course={course}
              onClick={() => navigate({ to: `/courses/${course.id}` })}
            />
          ))}
        </div>
      )}
    </div>
  );
}
