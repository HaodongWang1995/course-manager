import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Button,
  Card,
  CardContent,
  Input,
  Badge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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
} from "lucide-react";
import {
  useTeacherCourses,
  useAddCourse,
  useDeleteCourse,
  useUpdateCourseStatus,
} from "@/hooks/use-queries";
import type { Course } from "@/api/client";
import { StatCard } from "@/components/stat-card";
import { EmptyState } from "@/components/empty-state";
import { FormTextField, FormTextareaField, FormSelectField } from "@/components/form-field";
import { useForm } from "@tanstack/react-form";
import { courseFormValidator } from "@/lib/schemas";

export const Route = createFileRoute("/teacher/courses")({
  component: CoursesPage,
});

const statusLabels: Record<string, string> = {
  active: "已上架",
  draft: "草稿",
  archived: "已下架",
};

const statusColors: Record<string, string> = {
  active: "bg-green-50 text-green-700 border-green-200",
  draft: "bg-gray-50 text-gray-600 border-gray-200",
  archived: "bg-amber-50 text-amber-700 border-amber-200",
};

function CoursesPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showAddDialog, setShowAddDialog] = useState(false);

  const { data: courses = [], isLoading } = useTeacherCourses();
  const addCourseMutation = useAddCourse();
  const deleteCourseMutation = useDeleteCourse();

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (course.category || "").toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter =
        filterStatus === "all" || course.status === filterStatus;

      return matchesSearch && matchesFilter;
    });
  }, [courses, searchQuery, filterStatus]);

  const stats = useMemo(() => {
    const total = courses.length;
    const active = courses.filter((c) => c.status === "active").length;
    const draft = courses.filter((c) => c.status === "draft").length;
    const archived = courses.filter((c) => c.status === "archived").length;
    return { total, active, draft, archived };
  }, [courses]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">课程管理</h1>
          <p className="mt-1 text-sm text-gray-500">管理您的所有课程</p>
        </div>
        <Button className="gap-2" onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4" />
          新建课程
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="总课程数" value={stats.total} />
        <StatCard label="已上架" value={stats.active} color="text-green-600" />
        <StatCard label="草稿" value={stats.draft} color="text-gray-600" />
        <StatCard label="已下架" value={stats.archived} color="text-amber-600" />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="搜索课程名称..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="筛选状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部课程</SelectItem>
                <SelectItem value="active">已上架</SelectItem>
                <SelectItem value="draft">草稿</SelectItem>
                <SelectItem value="archived">已下架</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <div className="grid h-4 w-4 grid-cols-2 gap-0.5">
                  <div className="h-full w-full rounded-sm bg-current" />
                  <div className="h-full w-full rounded-sm bg-current" />
                  <div className="h-full w-full rounded-sm bg-current" />
                  <div className="h-full w-full rounded-sm bg-current" />
                </div>
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <div className="flex h-4 w-4 flex-col gap-0.5">
                  <div className="h-0.5 w-full rounded-sm bg-current" />
                  <div className="h-0.5 w-full rounded-sm bg-current" />
                  <div className="h-0.5 w-full rounded-sm bg-current" />
                </div>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Course Dialog */}
      <AddCourseDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={(data) => {
          addCourseMutation.mutate(data, {
            onSuccess: () => setShowAddDialog(false),
          });
        }}
        isLoading={addCourseMutation.isPending}
      />

      {/* Courses */}
      {filteredCourses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="没有找到课程"
          description={
            searchQuery || filterStatus !== "all"
              ? "尝试调整搜索或筛选条件"
              : "创建您的第一个课程"
          }
          action={
            !searchQuery && filterStatus === "all" ? (
              <Button className="gap-2" onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4" />
                新建课程
              </Button>
            ) : undefined
          }
        />
      ) : viewMode === "grid" ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <CourseGridCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCourses.map((course) => (
            <CourseListItem key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}

function CourseGridCard({ course }: { course: Course }) {
  const navigate = useNavigate();

  return (
    <div className="group relative">
      <Card
        className="cursor-pointer transition-shadow hover:shadow-md"
        onClick={() => navigate({ to: `/teacher/courses/${course.id}` })}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <Badge
              className={`border ${statusColors[course.status]}`}
              variant="outline"
            >
              {statusLabels[course.status]}
            </Badge>
            <div className="opacity-0 transition-opacity group-hover:opacity-100">
              <CourseActionsMenu course={course} />
            </div>
          </div>
          <h3 className="mt-3 text-lg font-semibold text-gray-900">{course.title}</h3>
          {course.description && (
            <p className="mt-1 line-clamp-2 text-sm text-gray-500">{course.description}</p>
          )}
          <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
            {course.category && <span>{course.category}</span>}
            <span>{course.lesson_count} 节课</span>
          </div>
          {course.price > 0 && (
            <div className="mt-2 text-lg font-bold text-blue-600">
              ¥{Number(course.price).toFixed(2)}
            </div>
          )}
        </CardContent>
      </Card>
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

function AddCourseDialog({
  open,
  onOpenChange,
  onAdd,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (data: { title: string; description?: string; price?: number; category?: string; status?: string }) => void;
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
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit" disabled={isLoading} className="min-w-[100px]">
              {isLoading ? "创建中..." : "创建课程"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
