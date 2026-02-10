import { cn } from "../lib/utils";
import { BookOpen, Users } from "lucide-react";

export interface CourseCardProps {
  code: string;
  name: string;
  section: string;
  studentCount: number;
  lessonCount: number;
  progress: number;
  className?: string;
}

export function CourseCard({
  code,
  name,
  section,
  studentCount,
  lessonCount,
  progress,
  className,
}: CourseCardProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div
      className={cn(
        "rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md",
        className
      )}
    >
      {/* Course code badge */}
      <span className="inline-block rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
        {code}
      </span>

      {/* Course name */}
      <h3 className="mt-3 text-base font-semibold text-gray-900">{name}</h3>

      {/* Section info */}
      <p className="mt-1 text-sm text-gray-500">{section}</p>

      {/* Stats row */}
      <div className="mt-4 flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <Users className="h-4 w-4 text-gray-400" />
          <span>
            {studentCount} {studentCount === 1 ? "student" : "students"}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <BookOpen className="h-4 w-4 text-gray-400" />
          <span>
            {lessonCount} {lessonCount === 1 ? "lesson" : "lessons"}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Progress</span>
          <span className="font-medium text-gray-900">{clampedProgress}%</span>
        </div>
        <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              clampedProgress === 100 ? "bg-green-500" : "bg-blue-600"
            )}
            style={{ width: `${clampedProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
