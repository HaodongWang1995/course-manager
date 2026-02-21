import { useState, useMemo } from "react";
import { Input } from "@course-manager/ui";
import { Search, Users } from "lucide-react";
import { useTeacherStudents } from "@/hooks/use-queries";
import { StudentFilters } from "./components/student-filters";
import { StudentTable } from "./components/student-table";


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

const PAGE_SIZE = 20;

export function StudentsPage() {
  const { data: rawStudents = [], isLoading } = useTeacherStudents();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [showAtRisk, setShowAtRisk] = useState(false);
  const [sortBy, setSortBy] = useState("name");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  // Derive students with display fields
  const students = useMemo(() => {
    return rawStudents.map((s, i) => ({
      ...s,
      initials: s.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase(),
      avatarColor: avatarColors[i % avatarColors.length],
      year: "-" as string,
      attendance: 0,
      status: "active" as string,
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

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedStudents = filteredStudents.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

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
            <StudentFilters
              avgAttendance={avgAttendance}
              courseFilters={courseFilters}
              selectedCourse={selectedCourse}
              onCourseChange={setSelectedCourse}
              selectedYear={selectedYear}
              onYearChange={setSelectedYear}
              showActiveOnly={showActiveOnly}
              onShowActiveOnlyChange={setShowActiveOnly}
              showAtRisk={showAtRisk}
              onShowAtRiskChange={setShowAtRisk}
            />
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            <StudentTable
              isLoading={isLoading}
              filteredStudents={filteredStudents}
              paginatedStudents={paginatedStudents}
              selectedIds={selectedIds}
              onSelectAll={(checked) => {
              if (checked) {
                setSelectedIds(new Set(filteredStudents.map((s) => s.id)));
              } else {
                setSelectedIds(new Set());
              }
              }}
              onSelectOne={(id, checked) => {
                const next = new Set(selectedIds);
                if (checked) next.add(id);
                else next.delete(id);
                setSelectedIds(next);
              }}
              onClearSelection={() => setSelectedIds(new Set())}
              sortBy={sortBy}
              onSortChange={setSortBy}
              totalPages={totalPages}
              safePage={safePage}
              onPageChange={setCurrentPage}
              totalStudents={students.length}
            />
          </div>
        </div>
      </div>
    </div>
  );
}