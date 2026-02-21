import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  Button,
  Card,
  CardContent,
  Badge,
  Progress,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@course-manager/ui";
import {
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  BookOpen,
  EyeOff,
  Users,
} from "lucide-react";
import { useDeleteCourse, useUpdateCourseStatus } from "@/hooks/use-queries";
import type { Course } from "@/api/client";

const statusLabels: Record<string, string> = {
  active: "Active",
  draft: "Draft",
  archived: "Archived",
};

const statusColors: Record<string, string> = {
  active: "bg-green-50 text-green-700 border-green-200",
  draft: "bg-gray-50 text-gray-600 border-gray-200",
  archived: "bg-amber-50 text-amber-700 border-amber-200",
};

// Colorful gradient covers for course cards (cycles through by index)
const coverGradients = [
  "from-blue-500 to-indigo-600",
  "from-orange-400 to-red-500",
  "from-purple-500 to-pink-600",
  "from-teal-400 to-cyan-600",
  "from-amber-400 to-orange-500",
  "from-green-400 to-emerald-600",
];

// Category → subject code prefix mapping
const categoryCodeMap: Record<string, string> = {
  数学: "MAT", math: "MAT",
  物理: "PHY", physics: "PHY",
  化学: "CHE", chemistry: "CHE",
  历史: "HIS", history: "HIS",
  英语: "ENG", english: "ENG",
  语文: "CHN", chinese: "CHN",
  计算机: "CS", computer: "CS",
  science: "SCI", 科学: "SCI",
  literature: "LIT", 文学: "LIT",
};

export function getCourseCode(category: string | undefined, idx: number): string {
  const lowerCat = (category || "").toLowerCase().trim();
  const prefix =
    Object.entries(categoryCodeMap).find(([key]) => lowerCat.includes(key))?.[1] ||
    (category ? category.slice(0, 3).toUpperCase() : "CRS");
  return `${prefix}${String(101 + idx).padStart(3, "0")}`;
}

export function getCoverGradient(idx: number): string {
  return coverGradients[idx % coverGradients.length];
}

export function CourseActionsMenu({ course }: { course: Course }) {
  const navigate = useNavigate();
  const { t } = useTranslation("teacherCourses");
  const deleteMutation = useDeleteCourse();
  const statusMutation = useUpdateCourseStatus();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            navigate({ to: `/teacher/courses/${course.id}` });
          }}
        >
          <Eye className="mr-2 h-4 w-4" />
          {t("card.viewDetail")}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            navigate({ to: `/teacher/courses/${course.id}` });
          }}
        >
          <Edit className="mr-2 h-4 w-4" />
          {t("card.edit")}
        </DropdownMenuItem>
        {course.status === "active" ? (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              statusMutation.mutate({ id: course.id, status: "archived" });
            }}
          >
            <EyeOff className="mr-2 h-4 w-4" />
            {t("card.archive")}
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              statusMutation.mutate({ id: course.id, status: "active" });
            }}
          >
            <Eye className="mr-2 h-4 w-4" />
            {t("card.publish")}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          className="text-red-600"
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm(t("card.confirmDelete"))) {
              deleteMutation.mutate(course.id);
            }
          }}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {t("card.delete")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function CourseGridCard({ course, index }: { course: Course; index: number }) {
  const navigate = useNavigate();
  const { t } = useTranslation("teacherCourses");
  const gradient = getCoverGradient(index);
  const courseCode = getCourseCode(course.category, index);
  const lessonCount = Number(course.lesson_count) || 0;
  const completedLessons = Number(course.completed_lessons) || 0;
  const enrollmentCount = Number(course.enrollment_count) || 0;
  const progress = lessonCount > 0 ? Math.round((completedLessons / lessonCount) * 100) : 0;

  return (
    <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Colorful gradient cover */}
      <div
        className={`relative h-[110px] bg-gradient-to-br ${gradient} cursor-pointer`}
        onClick={() => navigate({ to: `/teacher/courses/${course.id}` })}
      >
        {/* Subject code badge */}
        <div className="absolute left-3 top-3 rounded px-2 py-0.5 bg-white/20 backdrop-blur-sm">
          <span className="text-xs font-bold text-white tracking-wide">{courseCode}</span>
        </div>
        {/* Actions menu */}
        <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
          <div onClick={(e) => e.stopPropagation()}>
            <CourseActionsMenu course={course} />
          </div>
        </div>
        {/* Subtle icon background */}
        <BookOpen className="absolute bottom-3 right-3 h-12 w-12 text-white/20" />
      </div>

      {/* Card body */}
      <div
        className="cursor-pointer p-4"
        onClick={() => navigate({ to: `/teacher/courses/${course.id}` })}
      >
        <h3 className="text-[15px] font-semibold text-gray-900 leading-snug line-clamp-1">
          {course.title}
        </h3>
        {/* 4.3: Section info */}
        <p className="mt-0.5 text-xs text-gray-400">
          {course.category && <span>{course.category} · </span>}
          Section {String.fromCharCode(65 + (index % 3))} &bull; {["Mon, Wed", "Tue, Thu", "Mon, Wed, Fri"][index % 3]}
        </p>

        {/* Student count + Lesson count */}
        <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-gray-400" />
            <span>{t("card.students", { count: enrollmentCount })}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 text-gray-400" />
            <span>{t("card.lessons", { count: lessonCount })}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Course Progress</span>
            <span className="text-xs font-semibold text-blue-600">{progress}%</span>
          </div>
          <Progress value={progress} className="mt-1.5 h-1.5" />
        </div>
      </div>
    </div>
  );
}

export function CourseListItem({ course }: { course: Course }) {
  const navigate = useNavigate();

  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={() => navigate({ to: `/teacher/courses/${course.id}` })}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <Badge
                className={`border ${statusColors[course.status]}`}
                variant="outline"
              >
                {statusLabels[course.status]}
              </Badge>
              <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
            </div>
            {course.description && (
              <p className="mt-1 line-clamp-1 text-sm text-gray-500">{course.description}</p>
            )}
            <div className="mt-3 flex items-center gap-6 text-sm text-gray-500">
              {course.category && <span>{course.category}</span>}
              <span>{course.lesson_count} 节课</span>
              {course.price > 0 && (
                <span className="font-medium text-blue-600">
                  ¥{Number(course.price).toFixed(2)}
                </span>
              )}
            </div>
          </div>
          <div className="ml-4">
            <CourseActionsMenu course={course} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
