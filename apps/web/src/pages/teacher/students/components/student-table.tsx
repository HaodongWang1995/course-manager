import { Link } from "@tanstack/react-router";
import {
  Card,
  Badge,
  Avatar,
  AvatarFallback,
  Button,
} from "@course-manager/ui";
import {
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Eye,
} from "lucide-react";

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

const PAGE_SIZE = 20;

export interface DisplayStudent {
  id: string;
  name: string;
  email: string;
  courses: string[];
  initials: string;
  avatarColor: string;
  year: string;
  attendance: number;
  status: string;
}

interface StudentTableProps {
  isLoading: boolean;
  filteredStudents: DisplayStudent[];
  paginatedStudents: DisplayStudent[];
  selectedIds: Set<string>;
  onSelectAll: (checked: boolean) => void;
  onSelectOne: (id: string, checked: boolean) => void;
  onClearSelection: () => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  totalPages: number;
  safePage: number;
  onPageChange: (page: number) => void;
  totalStudents: number;
}

export function StudentTable({
  isLoading,
  filteredStudents,
  paginatedStudents,
  selectedIds,
  onSelectAll,
  onSelectOne,
  onClearSelection,
  sortBy,
  onSortChange,
  totalPages,
  safePage,
  onPageChange,
  totalStudents,
}: StudentTableProps) {
  return (
    <>
      {/* Stats Bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center gap-6">
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-gray-900">{filteredStudents.length}</span> students shown
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Printer className="h-3.5 w-3.5" />
            Print List
          </Button>
        </div>
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="mb-3 flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2">
          <span className="text-sm font-medium text-blue-700">{selectedIds.size} selected</span>
          <Button variant="outline" size="sm" className="h-7 gap-1 text-xs">
            <Download className="h-3 w-3" />
            Export
          </Button>
          <button
            className="ml-auto text-xs text-blue-500 hover:underline"
            onClick={onClearSelection}
          >
            Clear
          </button>
        </div>
      )}

      {/* Sort Controls */}
      <div className="mb-3 flex items-center justify-end gap-2">
        <ArrowUpDown className="h-4 w-4 text-gray-400" />
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="name">Sort by: Name (A-Z)</option>
          <option value="name-desc">Sort by: Name (Z-A)</option>
          <option value="attendance-high">Sort by: Attendance (High)</option>
          <option value="attendance-low">Sort by: Attendance (Low)</option>
          <option value="id">Sort by: Student ID</option>
        </select>
      </div>
      {/* Students Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/80">
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={selectedIds.size === filteredStudents.length && filteredStudents.length > 0}
                    onChange={(e) => onSelectAll(e.target.checked)}
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Student Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  ID Number
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Enrolled Courses
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Attendance Rate
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-gray-500">
                    加载中...
                  </td>
                </tr>
              ) : paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-gray-500">
                    {totalStudents === 0 ? "暂无学生数据（尚无学生报名课程）" : "没有符合条件的学生"}
                  </td>
                </tr>
              ) : null}
              {paginatedStudents.map((student) => (
                <tr
                  key={student.id}
                  className={`transition-colors hover:bg-gray-50/50 ${selectedIds.has(student.id) ? "bg-blue-50/40" : ""}`}
                >
                  <td className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={selectedIds.has(student.id)}
                      onChange={(e) => onSelectOne(student.id, e.target.checked)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback
                          className={`${student.avatarColor} text-xs font-medium text-white`}
                        >
                          {student.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{student.name}</p>
                        <p className="text-xs text-gray-500">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm text-gray-600">{student.id}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {student.courses.map((course) => (
                        <Badge key={course} variant="secondary" className="text-xs">
                          {course}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-16 overflow-hidden rounded-full bg-gray-200">
                        <div
                          className={`h-full rounded-full ${student.attendance >= 90 ? "bg-emerald-500" : student.attendance >= 75 ? "bg-amber-500" : "bg-red-500"}`}
                          style={{ width: `${student.attendance}%` }}
                        />
                      </div>
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${getAttendanceColor(student.attendance)} ${getAttendanceBg(student.attendance)}`}
                      >
                        {student.attendance}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      to="/teacher/students"
                      className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View Profile
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3">
          <p className="text-sm text-gray-600">
            第 <span className="font-medium">{(safePage - 1) * PAGE_SIZE + 1}</span>–
            <span className="font-medium">{Math.min(safePage * PAGE_SIZE, filteredStudents.length)}</span> 条，
            共 <span className="font-medium">{filteredStudents.length}</span> 条
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={safePage <= 1}
              onClick={() => onPageChange(safePage - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
              .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((item, idx) =>
                item === "..." ? (
                  <span key={`ellipsis-${idx}`} className="px-1 text-gray-400">...</span>
                ) : (
                  <Button
                    key={item}
                    size="sm"
                    variant={item === safePage ? "default" : "outline"}
                    className="h-8 w-8 p-0"
                    onClick={() => onPageChange(item as number)}
                  >
                    {item}
                  </Button>
                )
              )}
            <Button
              variant="outline"
              size="sm"
              disabled={safePage >= totalPages}
              onClick={() => onPageChange(safePage + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
