import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Avatar,
  AvatarFallback,
  Button,
  Input,
} from "@course-manager/ui";
import {
  Search,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  Users,
  Filter,
  ArrowUpDown,
  Eye,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useTeacherStudents } from "@/hooks/use-queries";

export const Route = createFileRoute("/teacher/students")({
  component: TeacherStudentsDirectory,
});

const gradeFilters = [
  { label: "All Years", value: "all" },
  { label: "Freshman", value: "freshman" },
  { label: "Sophomore", value: "sophomore" },
  { label: "Junior", value: "junior" },
  { label: "Senior", value: "senior" },
];

const avatarColors = [
  "bg-violet-500", "bg-blue-500", "bg-emerald-500",
  "bg-amber-500", "bg-rose-500", "bg-teal-500",
];

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

function TeacherStudentsDirectory() {
  const { data: rawStudents = [] } = useTeacherStudents();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [showAtRisk, setShowAtRisk] = useState(false);
  const [sortBy, setSortBy] = useState("name");

  // Derive students with display fields
  const students = useMemo(() => {
    return rawStudents.map((s, i) => ({
      ...s,
      initials: s.initials || s.name.split(" ").map((n) => n[0]).join(""),
      avatarColor: avatarColors[i % avatarColors.length],
      year: "Sophomore" as string,
      status: s.attendance < 60 ? "at-risk" : "active",
    }));
  }, [rawStudents]);

  // Derive unique courses for filter sidebar
  const courseFilters = useMemo(() => {
    const courseSet = new Map<string, number>();
    students.forEach((s) => s.courses.forEach((c) => {
      courseSet.set(c, (courseSet.get(c) || 0) + 1);
    }));
    return [
      { label: "All Courses", value: "all", count: students.length },
      ...Array.from(courseSet.entries()).map(([name, count]) => ({
        label: name,
        value: name.toLowerCase().replace(/\s+/g, ""),
        count,
      })),
    ];
  }, [students]);

  // Apply filters and search
  const filteredStudents = useMemo(() => {
    let result = students;

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q)
      );
    }

    // Course filter
    if (selectedCourse !== "all") {
      result = result.filter((s) =>
        s.courses.some((c) => c.toLowerCase().replace(/\s+/g, "") === selectedCourse)
      );
    }

    // Year filter
    if (selectedYear !== "all") {
      result = result.filter(
        (s) => s.year.toLowerCase() === selectedYear
      );
    }

    // Status
    if (showActiveOnly) result = result.filter((s) => s.status === "active");
    if (showAtRisk) result = result.filter((s) => s.status === "at-risk");

    // Sort
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "name-desc": return b.name.localeCompare(a.name);
        case "attendance-high": return b.attendance - a.attendance;
        case "attendance-low": return a.attendance - b.attendance;
        case "id": return a.id.localeCompare(b.id);
        default: return a.name.localeCompare(b.name);
      }
    });

    return result;
  }, [students, searchQuery, selectedCourse, selectedYear, showActiveOnly, showAtRisk, sortBy]);

  const avgAttendance = students.length
    ? (students.reduce((sum, s) => sum + s.attendance, 0) / students.length).toFixed(1)
    : "0";

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Students Directory
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              <Users className="mr-1 inline-block h-4 w-4" />
              {students.filter((s) => s.status === "active").length} Active Students
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search students by name, ID..."
                className="w-72 pl-9"
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchQuery(e.target.value)
                }
              />
            </div>
            <select className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
              <option>Fall Semester 2023</option>
              <option>Spring Semester 2024</option>
              <option>Summer 2023</option>
            </select>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Left Sidebar Filters */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <Filter className="h-4 w-4" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Enrolled Course Filter */}
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Enrolled Course
                  </h4>
                  <div className="space-y-1">
                    {courseFilters.map((course) => (
                      <button
                        key={course.value}
                        onClick={() => setSelectedCourse(course.value)}
                        className={`flex w-full items-center justify-between rounded-md px-3 py-1.5 text-sm transition-colors ${
                          selectedCourse === course.value
                            ? "bg-blue-50 font-medium text-blue-700"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <span>{course.label}</span>
                        <span className="text-xs text-gray-400">
                          {course.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grade/Year Filter */}
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Grade / Year
                  </h4>
                  <div className="space-y-1">
                    {gradeFilters.map((grade) => (
                      <button
                        key={grade.value}
                        onClick={() => setSelectedYear(grade.value)}
                        className={`w-full rounded-md px-3 py-1.5 text-left text-sm transition-colors ${
                          selectedYear === grade.value
                            ? "bg-blue-50 font-medium text-blue-700"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {grade.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status Toggles */}
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Status
                  </h4>
                  <div className="space-y-2">
                    <label className="flex cursor-pointer items-center justify-between rounded-md px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50">
                      <span>Active Only</span>
                      <input
                        type="checkbox"
                        checked={showActiveOnly}
                        onChange={() => setShowActiveOnly(!showActiveOnly)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </label>
                    <label className="flex cursor-pointer items-center justify-between rounded-md px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50">
                      <span>At-Risk Students</span>
                      <input
                        type="checkbox"
                        checked={showAtRisk}
                        onChange={() => setShowAtRisk(!showAtRisk)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Stats Bar */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
                    Avg Attendance
                  </span>
                  <span className="text-lg font-bold text-emerald-600">
                    {avgAttendance}%
                  </span>
                </div>
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

            {/* Sort Controls */}
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing <span className="font-medium text-gray-900">{filteredStudents.length}</span>{" "}
                students
              </p>
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="name">Sort by: Name (A-Z)</option>
                  <option value="name-desc">Sort by: Name (Z-A)</option>
                  <option value="attendance-high">Sort by: Attendance (High)</option>
                  <option value="attendance-low">Sort by: Attendance (Low)</option>
                  <option value="id">Sort by: Student ID</option>
                </select>
              </div>
            </div>

            {/* Students Table */}
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50/80">
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
                    {filteredStudents.map((student) => (
                      <tr
                        key={student.id}
                        className="transition-colors hover:bg-gray-50/50"
                      >
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
                              <p className="text-sm font-medium text-gray-900">
                                {student.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {student.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-sm text-gray-600">
                            {student.id}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {student.courses.map((course) => (
                              <Badge
                                key={course}
                                variant="secondary"
                                className="text-xs"
                              >
                                {course}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-16 overflow-hidden rounded-full bg-gray-200">
                              <div
                                className={`h-full rounded-full ${
                                  student.attendance >= 90
                                    ? "bg-emerald-500"
                                    : student.attendance >= 75
                                      ? "bg-amber-500"
                                      : "bg-red-500"
                                }`}
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
            <div className="mt-4 flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3">
              <p className="text-sm text-gray-600">
                Showing <span className="font-medium">1</span> to{" "}
                <span className="font-medium">{filteredStudents.length}</span> of{" "}
                <span className="font-medium">{students.length}</span> results
              </p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" disabled>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  className="h-8 w-8 bg-blue-600 p-0 text-white hover:bg-blue-700"
                >
                  1
                </Button>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                  2
                </Button>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                  3
                </Button>
                <span className="px-1 text-gray-400">...</span>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                  24
                </Button>
                <Button variant="outline" size="sm">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
