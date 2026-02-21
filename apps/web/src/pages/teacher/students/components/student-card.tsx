import { Link } from "@tanstack/react-router";
import { Badge, Avatar, AvatarFallback } from "@course-manager/ui";
import { Eye } from "lucide-react";
import type { DisplayStudent } from "./student-table";

interface StudentCardProps {
  student: DisplayStudent;
  isSelected: boolean;
  onSelect: (id: string, checked: boolean) => void;
}

function getAttendanceColor(rate: number) {
  if (rate >= 90) return "text-emerald-600";
  if (rate >= 75) return "text-amber-600";
  return "text-red-600";
}

function getAttendanceBg(rate: number) {
  if (rate >= 90) return "bg-emerald-50";
  if (rate >= 75) return "bg-amber-50";
  return "bg-red-50";
}

export function StudentCard({ student, isSelected, onSelect }: StudentCardProps) {
  return (
    <div className={`rounded-lg border p-4 ${isSelected ? "border-blue-300 bg-blue-50/40" : "border-gray-200 bg-white"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            checked={isSelected}
            onChange={(e) => onSelect(student.id, e.target.checked)}
          />
          <Avatar className="h-10 w-10">
            <AvatarFallback className={`${student.avatarColor} text-xs font-medium text-white`}>
              {student.initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-gray-900">{student.name}</p>
            <p className="text-xs text-gray-500">{student.email}</p>
            <p className="mt-0.5 font-mono text-xs text-gray-400">{student.id}</p>
          </div>
        </div>
        <Link
          to="/teacher/students"
          className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          <Eye className="h-3.5 w-3.5" />
          View
        </Link>
      </div>
      <div className="mt-3 flex flex-wrap gap-1">
        {student.courses.map((course) => (
          <Badge key={course} variant="secondary" className="text-xs">
            {course}
          </Badge>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
          <div className={`h-full rounded-full ${student.attendance >= 90 ? "bg-emerald-500" : student.attendance >= 75 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${student.attendance}%` }} />
        </div>
        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${getAttendanceColor(student.attendance)} ${getAttendanceBg(student.attendance)}`}>{student.attendance}%</span>
      </div>
    </div>
  );
}
