import { useState, useMemo } from "react";
import { Button, Dialog, DialogTrigger } from "@course-manager/ui";
import { Plus, BookOpen } from "lucide-react";
import { useTeacherCourses, useAddCourse } from "@/hooks/use-queries";
import { EmptyState } from "@/components/empty-state";
import { CourseGridCard } from "./components/course-card";
import { CourseFilters } from "./components/course-filters";
import { CreateCourseDialog } from "./components/create-course-dialog";

export function TeacherCoursesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);

  const { data: courses = [], isLoading } = useTeacherCourses();
  const addCourseMutation = useAddCourse();

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (course.category || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === "all" || course.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [courses, searchQuery, filterStatus]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Courses Management</h1>
            <p className="mt-1 text-sm text-gray-500">Manage your courses and curriculum</p>
          </div>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create New Course
            </Button>
          </DialogTrigger>
        </div>

        {/* Search + Filter bar */}
        <CourseFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterStatus={filterStatus}
          onFilterChange={setFilterStatus}
        />

        {/* Courses Grid */}
        {filteredCourses.length === 0 && !showAddDialog ? (
          <EmptyState
            icon={BookOpen}
            title="No courses found"
            description={
              searchQuery || filterStatus !== "all"
                ? "Try adjusting your search or filter"
                : "Create your first course"
            }
            action={
              !searchQuery && filterStatus === "all" ? (
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create New Course
                  </Button>
                </DialogTrigger>
              ) : undefined
            }
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filteredCourses.map((course, idx) => (
              <CourseGridCard key={course.id} course={course} index={idx} />
            ))}
            {/* "Create New Course" placeholder card */}
            <DialogTrigger asChild>
              <div className="flex min-h-[240px] cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-200 p-6 text-center transition-colors hover:border-blue-300 hover:bg-blue-50/30">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                  <Plus className="h-6 w-6 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Create New Course</p>
                  <p className="mt-1 text-xs text-gray-400">Add a new subject to your curriculum</p>
                </div>
              </div>
            </DialogTrigger>
          </div>
        )}

        <CreateCourseDialog
          onAdd={(data) => {
            addCourseMutation.mutate(data, {
              onSuccess: () => setShowAddDialog(false),
            });
          }}
          onClose={() => setShowAddDialog(false)}
          isLoading={addCourseMutation.isPending}
        />
      </div>
    </Dialog>
  );
}
