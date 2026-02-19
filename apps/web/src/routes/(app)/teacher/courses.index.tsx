import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Button,
  Card,
  CardContent,
  Input,
  Badge,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Progress,
} from "@course-manager/ui";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  BookOpen,
  EyeOff,
  Users,
} from "lucide-react";
import {
  useTeacherCourses,
  useAddCourse,
  useDeleteCourse,
  useUpdateCourseStatus,
} from "@/hooks/use-queries";
import type { Course } from "@/api/client";
import { EmptyState } from "@/components/empty-state";
import { FormTextField, FormTextareaField, FormSelectField } from "@/components/form-field";
import { useForm } from "@tanstack/react-form";
import { courseFormValidator } from "@/lib/schemas";

export const Route = createFileRoute("/(app)/teacher/courses/")({
  component: CoursesIndexPage,
});

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

function getCourseCode(category: string | undefined, idx: number): string {
  const lowerCat = (category || "").toLowerCase().trim();
  const prefix =
    Object.entries(categoryCodeMap).find(([key]) => lowerCat.includes(key))?.[1] ||
    (category ? category.slice(0, 3).toUpperCase() : "CRS");
  return `${prefix}${String(101 + idx).padStart(3, "0")}`;
}

function getCoverGradient(idx: number): string {
  return coverGradients[idx % coverGradients.length];
}

function CoursesIndexPage() {
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 shrink-0">
                <Filter className="h-4 w-4" />
                Filter
                {filterStatus !== "all" && (
                  <Badge className="ml-1 h-5 px-1.5 text-xs bg-blue-600 text-white border-0">
                    1
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {[
                { value: "all", label: "All Courses" },
                { value: "active", label: "Active" },
                { value: "draft", label: "Draft" },
                { value: "archived", label: "Archived" },
              ].map((opt) => (
                <DropdownMenuItem
                  key={opt.value}
                  onClick={() => setFilterStatus(opt.value)}
                  className={filterStatus === opt.value ? "font-medium text-blue-600" : ""}
                >
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

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

        <AddCourseDialogContent
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

function CourseGridCard({ course, index }: { course: Course; index: number }) {
  const navigate = useNavigate();
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
            <span>{enrollmentCount} Students</span>
          </div>
          <div className="flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 text-gray-400" />
            <span>{lessonCount} Lessons</span>
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

function CourseListItem({ course }: { course: Course }) {
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

function CourseActionsMenu({ course }: { course: Course }) {
  const navigate = useNavigate();
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
          查看详情
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            navigate({ to: `/teacher/courses/${course.id}` });
          }}
        >
          <Edit className="mr-2 h-4 w-4" />
          编辑课程
        </DropdownMenuItem>
        {course.status === "active" ? (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              statusMutation.mutate({ id: course.id, status: "archived" });
            }}
          >
            <EyeOff className="mr-2 h-4 w-4" />
            下架课程
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              statusMutation.mutate({ id: course.id, status: "active" });
            }}
          >
            <Eye className="mr-2 h-4 w-4" />
            上架课程
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          className="text-red-600"
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm(`确定要删除课程 "${course.title}" 吗？`)) {
              deleteMutation.mutate(course.id);
            }
          }}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          删除课程
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AddCourseDialogContent({
  onAdd,
  onClose,
  isLoading,
}: {
  onAdd: (data: {
    title: string;
    description?: string;
    price?: number;
    category?: string;
    status?: string;
  }) => void;
  onClose: () => void;
  isLoading: boolean;
}) {
  const form = useForm({
    defaultValues: {
      title: "",
      description: "" as string | undefined,
      price: undefined as number | undefined,
      category: "" as string | undefined,
      status: "active" as "active" | "draft",
    },
    validators: {
      onChange: courseFormValidator,
    },
    onSubmit: ({ value }) => {
      onAdd({
        title: value.title,
        description: value.description || undefined,
        price: value.price,
        category: value.category || undefined,
        status: value.status,
      });
      form.reset();
    },
  });

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>新建课程</DialogTitle>
        <DialogDescription>填写课程基本信息，创建后可继续编辑详情</DialogDescription>
      </DialogHeader>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="space-y-5"
      >
        <form.Field name="title">
          {(field) => (
            <FormTextField
              field={field}
              label="课程标题"
              required
              placeholder="例如: 线性代数"
              autoFocus
            />
          )}
        </form.Field>

        <form.Field name="description">
          {(field) => (
            <FormTextareaField
              field={field}
              label="课程描述"
              placeholder="简要介绍课程内容和目标..."
            />
          )}
        </form.Field>

        <div className="grid grid-cols-2 gap-4">
          <form.Field name="price">
            {(field) => (
              <FormTextField
                field={field}
                label="价格 (¥)"
                type="number"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            )}
          </form.Field>

          <form.Field name="category">
            {(field) => (
              <FormTextField
                field={field}
                label="分类"
                placeholder="例如: 数学"
              />
            )}
          </form.Field>
        </div>

        <form.Field name="status">
          {(field) => (
            <FormSelectField
              field={field}
              label="发布状态"
              options={[
                { value: "active", label: "立即上架" },
                { value: "draft", label: "保存为草稿" },
              ]}
            />
          )}
        </form.Field>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button type="submit" disabled={isLoading} className="min-w-[100px]">
            {isLoading ? "创建中..." : "创建课程"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
