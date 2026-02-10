import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Badge,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@course-manager/ui";
import {
  ArrowLeft,
  Edit,
  Clock,
  MapPin,
  Plus,
  Trash2,
  Save,
} from "lucide-react";
import {
  useCourseDetail,
  useUpdateCourse,
  useUpdateCourseStatus,
  useAddSchedule,
  useDeleteSchedule,
} from "@/hooks/use-queries";

export const Route = createFileRoute("/teacher/courses/$courseId")({
  component: TeacherCourseDetail,
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

function TeacherCourseDetail() {
  const { courseId } = Route.useParams();
  const navigate = useNavigate();
  const { data: course, isLoading } = useCourseDetail(courseId);
  const updateMutation = useUpdateCourse();
  const statusMutation = useUpdateCourseStatus();
  const addScheduleMutation = useAddSchedule();
  const deleteScheduleMutation = useDeleteSchedule();

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [showAddSchedule, setShowAddSchedule] = useState(false);

  const startEditing = () => {
    if (!course) return;
    setTitle(course.title);
    setDescription(course.description || "");
    setPrice(String(course.price || ""));
    setCategory(course.category || "");
    setEditing(true);
  };

  const handleSave = () => {
    updateMutation.mutate(
      {
        id: courseId,
        data: {
          title,
          description: description || undefined,
          price: price ? parseFloat(price) : undefined,
          category: category || undefined,
        },
      },
      { onSuccess: () => setEditing(false) }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-gray-500">课程不存在</p>
        <Button className="mt-4" variant="outline" onClick={() => navigate({ to: "/teacher/courses" })}>
          返回课程列表
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Back */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          className="gap-2"
          onClick={() => navigate({ to: "/teacher/courses" })}
        >
          <ArrowLeft className="h-4 w-4" />
          返回课程列表
        </Button>
        <div className="flex gap-2">
          {!editing && (
            <Button variant="outline" className="gap-2" onClick={startEditing}>
              <Edit className="h-4 w-4" />
              编辑
            </Button>
          )}
          <Select
            value={course.status}
            onValueChange={(val) => statusMutation.mutate({ id: courseId, status: val })}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">上架</SelectItem>
              <SelectItem value="draft">草稿</SelectItem>
              <SelectItem value="archived">下架</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Course Info */}
      <Card>
        <CardContent className="p-6">
          {editing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>课程标题</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>课程描述</Label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="flex min-h-[100px] w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>价格 (¥)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>分类</Label>
                  <Input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={updateMutation.isPending} className="gap-2">
                  <Save className="h-4 w-4" />
                  {updateMutation.isPending ? "保存中..." : "保存"}
                </Button>
                <Button variant="outline" onClick={() => setEditing(false)}>
                  取消
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    {course.category && (
                      <Badge variant="outline">{course.category}</Badge>
                    )}
                    <Badge
                      className={`border ${statusColors[course.status]}`}
                      variant="outline"
                    >
                      {statusLabels[course.status]}
                    </Badge>
                  </div>
                  <h1 className="mt-3 text-2xl font-bold text-gray-900">{course.title}</h1>
                </div>
                {course.price > 0 ? (
                  <div className="text-2xl font-bold text-blue-600">
                    ¥{Number(course.price).toFixed(2)}
                  </div>
                ) : (
                  <span className="text-sm font-medium text-green-600">免费</span>
                )}
              </div>
              {course.description && (
                <p className="mt-4 whitespace-pre-line text-sm text-gray-600">
                  {course.description}
                </p>
              )}
              <p className="mt-4 text-xs text-gray-400">
                创建于 {new Date(course.created_at).toLocaleString("zh-CN")}
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Schedules */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>课程日程 ({course.schedules?.length || 0})</CardTitle>
          <Button
            size="sm"
            className="gap-1"
            onClick={() => setShowAddSchedule(true)}
          >
            <Plus className="h-4 w-4" />
            添加课时
          </Button>
        </CardHeader>
        <CardContent>
          {(!course.schedules || course.schedules.length === 0) ? (
            <p className="py-8 text-center text-sm text-gray-500">暂无课时，点击上方按钮添加</p>
          ) : (
            <div className="space-y-3">
              {course.schedules.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-4 rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">
                    {s.lesson_number}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">
                      {s.title || `第 ${s.lesson_number} 课`}
                    </h4>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(s.start_time).toLocaleString("zh-CN")} -{" "}
                        {new Date(s.end_time).toLocaleTimeString("zh-CN")}
                      </span>
                      {s.room && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {s.room}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => {
                      if (window.confirm("确定要删除此课时吗？")) {
                        deleteScheduleMutation.mutate(s.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Schedule Dialog */}
      <AddScheduleDialog
        open={showAddSchedule}
        onOpenChange={setShowAddSchedule}
        courseId={courseId}
        nextLessonNumber={(course.schedules?.length || 0) + 1}
        onAdd={(data) => {
          addScheduleMutation.mutate(
            { courseId, data },
            { onSuccess: () => setShowAddSchedule(false) }
          );
        }}
        isLoading={addScheduleMutation.isPending}
      />
    </div>
  );
}

function AddScheduleDialog({
  open,
  onOpenChange,
  courseId,
  nextLessonNumber,
  onAdd,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  courseId: string;
  nextLessonNumber: number;
  onAdd: (data: { lesson_number: number; title: string; start_time: string; end_time: string; room: string }) => void;
  isLoading: boolean;
}) {
  const [lessonNumber, setLessonNumber] = useState(String(nextLessonNumber));
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [room, setRoom] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startTime || !endTime) return;
    onAdd({
      lesson_number: parseInt(lessonNumber) || nextLessonNumber,
      title,
      start_time: startTime,
      end_time: endTime,
      room,
    });
    setTitle("");
    setStartTime("");
    setEndTime("");
    setRoom("");
    setLessonNumber(String(nextLessonNumber + 1));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>添加课时</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>课时编号</Label>
              <Input
                type="number"
                value={lessonNumber}
                onChange={(e) => setLessonNumber(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>教室</Label>
              <Input
                placeholder="例如: A-301"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>课时标题</Label>
            <Input
              placeholder="例如: 矩阵基础"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>开始时间</Label>
              <Input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>结束时间</Label>
              <Input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "添加中..." : "添加课时"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
