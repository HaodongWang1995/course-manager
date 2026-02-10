import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  CourseCard,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
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
} from "lucide-react";
import { useTeacherCourses, useAddCourse, useDeleteCourse } from "@/hooks/use-queries";
import { teacherCoursesStore } from "@/api/storage";

export const Route = createFileRoute("/teacher/courses")({
  component: CoursesPage,
});

function CoursesPage() {
  const navigate = useNavigate();
  const { data: courses = [], isLoading } = useTeacherCourses();
  const addCourseMutation = useAddCourse();
  const deleteCourseMutation = useDeleteCourse();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Filter and search courses
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.code.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter =
        filterStatus === "all" ||
        (filterStatus === "active" && course.progress < 100) ||
        (filterStatus === "completed" && course.progress === 100);

      return matchesSearch && matchesFilter;
    });
  }, [courses, searchQuery, filterStatus]);

  const stats = useMemo(() => {
    const total = courses.length;
    const active = courses.filter((c) => c.progress < 100).length;
    const completed = courses.filter((c) => c.progress === 100).length;
    const avgProgress =
      courses.reduce((sum, c) => sum + c.progress, 0) / total || 0;

    return { total, active, completed, avgProgress };
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
          <p className="mt-1 text-sm text-gray-500">
            管理您的所有课程和学生
          </p>
        </div>
        <Button className="gap-2" onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4" />
          新建课程
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              总课程数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              进行中
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              已完成
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.completed}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              平均进度
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {Math.round(stats.avgProgress)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="搜索课程名称或代码..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="筛选状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部课程</SelectItem>
                <SelectItem value="active">进行中</SelectItem>
                <SelectItem value="completed">已完成</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode Toggle */}
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
        onAdd={(course) => {
          addCourseMutation.mutate(course);
          setShowAddDialog(false);
        }}
      />

      {/* Courses List */}
      {filteredCourses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400" />
            <p className="mt-4 text-sm font-medium text-gray-900">
              没有找到课程
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery || filterStatus !== "all"
                ? "尝试调整搜索或筛选条件"
                : "创建您的第一个课程"}
            </p>
            {!searchQuery && filterStatus === "all" && (
              <Button className="mt-4 gap-2" onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4" />
                新建课程
              </Button>
            )}
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <CourseCardWithActions key={course.code} course={course} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCourses.map((course) => (
            <CourseListItem key={course.code} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}

function CourseCardWithActions({
  course,
}: {
  course: {
    code: string;
    name: string;
    section: string;
    studentCount: number;
    lessonCount: number;
    progress: number;
  };
}) {
  const navigate = useNavigate();
  
  return (
    <div className="relative group">
      <div
        onClick={() => navigate({ to: `/teacher/courses/${course.code}` })}
        className="cursor-pointer"
      >
        <CourseCard
          code={course.code}
          name={course.name}
          section={course.section}
          studentCount={course.studentCount}
          lessonCount={course.lessonCount}
          progress={course.progress}
        />
      </div>
      <div className="absolute right-4 top-4 opacity-0 transition-opacity group-hover:opacity-100">
        <CourseActionsMenu course={course} />
      </div>
    </div>
  );
}

function CourseListItem({
  course,
}: {
  course: {
    code: string;
    name: string;
    section: string;
    studentCount: number;
    lessonCount: number;
    progress: number;
  };
}) {
  const navigate = useNavigate();
  
  return (
    <Card
      onClick={() => navigate({ to: `/teacher/courses/${course.code}` })}
      className="cursor-pointer transition-shadow hover:shadow-md"
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <Badge variant="default">{course.code}</Badge>
              <h3 className="text-lg font-semibold text-gray-900">
                {course.name}
              </h3>
            </div>
            <p className="mt-1 text-sm text-gray-500">{course.section}</p>
            <div className="mt-3 flex items-center gap-6 text-sm text-gray-500">
              <span>{course.studentCount} 名学生</span>
              <span>{course.lessonCount} 节课</span>
              <span className="font-medium text-gray-900">
                进度: {course.progress}%
              </span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className={`h-full rounded-full transition-all ${
                  course.progress === 100 ? "bg-green-500" : "bg-blue-600"
                }`}
                style={{ width: `${course.progress}%` }}
              />
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

function CourseActionsMenu({
  course,
}: {
  course: {
    code: string;
    name: string;
  };
}) {
  const navigate = useNavigate();
  const deleteMutation = useDeleteCourse();

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
            navigate({ to: `/teacher/courses/${course.code}` });
          }}
        >
          <Eye className="mr-2 h-4 w-4" />
          查看详情
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            navigate({ to: `/teacher/courses/${course.code}` });
          }}
        >
          <Edit className="mr-2 h-4 w-4" />
          编辑课程
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-red-600"
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm(`确定要删除课程 "${course.name}" 吗？`)) {
              deleteMutation.mutate(course.code);
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

// ── Add Course Dialog ──────────────────────────────

function AddCourseDialog({
  open,
  onOpenChange,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (course: { code: string; name: string; section: string; studentCount: number; lessonCount: number }) => void;
}) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [section, setSection] = useState("");
  const [studentCount, setStudentCount] = useState("");
  const [lessonCount, setLessonCount] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name) return;
    onAdd({
      code,
      name,
      section: section || "Section A",
      studentCount: parseInt(studentCount) || 0,
      lessonCount: parseInt(lessonCount) || 0,
    });
    setCode("");
    setName("");
    setSection("");
    setStudentCount("");
    setLessonCount("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新建课程</DialogTitle>
          <DialogDescription>填写课程信息以创建新课程</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="course-code">课程代码</Label>
            <Input
              id="course-code"
              placeholder="例如: MAT101"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="course-name">课程名称</Label>
            <Input
              id="course-name"
              placeholder="例如: 线性代数"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="course-section">班级信息</Label>
            <Input
              id="course-section"
              placeholder="例如: Section A • Mon, Wed"
              value={section}
              onChange={(e) => setSection(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="student-count">学生人数</Label>
              <Input
                id="student-count"
                type="number"
                placeholder="0"
                value={studentCount}
                onChange={(e) => setStudentCount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lesson-count">课时数</Label>
              <Input
                id="lesson-count"
                type="number"
                placeholder="0"
                value={lessonCount}
                onChange={(e) => setLessonCount(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit">创建课程</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
