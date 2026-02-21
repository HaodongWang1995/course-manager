import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
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
  FileUploadZone,
  AttachmentList,
} from "@course-manager/ui";
import {
  ArrowLeft,
  Edit,
  Clock,
  MapPin,
  Plus,
  Trash2,
  Save,
  Paperclip,
  BookOpen,
  FileText,
  Calendar,
} from "lucide-react";
import {
  useCourseDetail,
  useUpdateCourse,
  useUpdateCourseStatus,
  useAddSchedule,
  useDeleteSchedule,
  useCourseAttachments,
  useUploadAttachment,
  useDeleteAttachment,
  useCourseAssignments,
  useCreateAssignment,
  useDeleteAssignment,
  useCourseResources,
  useCreateResource,
  useDeleteResource,
} from "@/hooks/use-queries";
import { useForm } from "@tanstack/react-form";
import { scheduleFormValidator } from "@/lib/schemas";
import { FormTextField, FormDateTimeField } from "@/components/form-field";
import { formatLocalDateTime, formatLocalTime } from "@/lib/time";

export const Route = createFileRoute("/(app)/teacher/courses/$courseId")({
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
  const { t } = useTranslation();
  const { courseId } = Route.useParams();
  const navigate = useNavigate();
  const { data: course, isLoading } = useCourseDetail(courseId);
  const updateMutation = useUpdateCourse();
  const statusMutation = useUpdateCourseStatus();
  const addScheduleMutation = useAddSchedule();
  const deleteScheduleMutation = useDeleteSchedule();
  const { data: attachments = [] } = useCourseAttachments(courseId);
  const uploadMutation = useUploadAttachment();
  const deleteAttachmentMutation = useDeleteAttachment();
  const { data: assignments = [] } = useCourseAssignments(courseId);
  const createAssignmentMutation = useCreateAssignment();
  const deleteAssignmentMutation = useDeleteAssignment();
  const { data: resources = [] } = useCourseResources(courseId);
  const createResourceMutation = useCreateResource();
  const deleteResourceMutation = useDeleteResource();

  const [showAddAssignment, setShowAddAssignment] = useState(false);
  const [showAddResource, setShowAddResource] = useState(false);
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
                        {formatLocalDateTime(s.start_time)} -{" "}
                        {formatLocalTime(s.end_time)}
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
                    variant="ghost-destructive"
                    size="icon"
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

      {/* Attachments */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Paperclip className="h-5 w-5 text-gray-500" />
          <CardTitle>课程附件 ({attachments.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FileUploadZone
            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.mp4,.zip"
            maxSizeMB={50}
            uploading={uploadMutation.isPending}
            uploadPromptText={t("upload.prompt")}
            maxSizeText={t("upload.maxSize", { mb: 50 })}
            uploadingText={t("upload.uploading")}
            tooLargeText={t("upload.tooLarge", { mb: 50 })}
            onFileSelect={(files) => {
              for (const file of files) {
                uploadMutation.mutate({ file, courseId });
              }
            }}
          />
          <AttachmentList
            attachments={attachments}
            onDelete={(id) => deleteAttachmentMutation.mutate(id)}
            isDeleting={deleteAttachmentMutation.isPending}
            emptyText={t("attachments.empty")}
          />
        </CardContent>
      </Card>

      {/* Assignments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-gray-500" />
            <CardTitle>作业 ({assignments.length})</CardTitle>
          </div>
          <Button size="sm" variant="outline" onClick={() => setShowAddAssignment(true)}>
            <Plus className="h-4 w-4 mr-1" /> 添加作业
          </Button>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <p className="py-4 text-center text-sm text-gray-400">暂无作业</p>
          ) : (
            <div className="space-y-2">
              {assignments.map((a) => (
                <div key={a.id} className="flex items-start justify-between gap-3 rounded-lg border border-gray-200 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">{a.title}</p>
                    {a.description && (
                      <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">{a.description}</p>
                    )}
                    <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                      <Calendar className="h-3 w-3" />
                      截止：{new Date(a.due_date).toLocaleDateString("zh-CN")}
                    </p>
                  </div>
                  <Button
                    variant="ghost-destructive"
                    size="icon"
                    onClick={() => {
                      if (window.confirm("确定要删除此作业吗？")) {
                        deleteAssignmentMutation.mutate({ id: a.id, courseId });
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

      {/* Resources */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-gray-500" />
            <CardTitle>课程资源 ({resources.length})</CardTitle>
          </div>
          <Button size="sm" variant="outline" onClick={() => setShowAddResource(true)}>
            <Plus className="h-4 w-4 mr-1" /> 添加资源
          </Button>
        </CardHeader>
        <CardContent>
          {resources.length === 0 ? (
            <p className="py-4 text-center text-sm text-gray-400">暂无课程资源</p>
          ) : (
            <div className="space-y-2">
              {resources.map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">{r.title}</p>
                    {(r.file_type || r.file_size) && (
                      <p className="mt-0.5 text-xs text-gray-400">
                        {r.file_type}{r.file_type && r.file_size ? " · " : ""}{r.file_size}
                        {r.featured && <span className="ml-2 text-blue-500">精选</span>}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost-destructive"
                    size="icon"
                    onClick={() => {
                      if (window.confirm("确定要删除此资源吗？")) {
                        deleteResourceMutation.mutate({ id: r.id, courseId });
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

      {/* Add Assignment Dialog */}
      <AddAssignmentDialog
        open={showAddAssignment}
        onOpenChange={setShowAddAssignment}
        onAdd={(data) => {
          createAssignmentMutation.mutate(
            { courseId, data },
            { onSuccess: () => setShowAddAssignment(false) }
          );
        }}
        isLoading={createAssignmentMutation.isPending}
      />

      {/* Add Resource Dialog */}
      <AddResourceDialog
        open={showAddResource}
        onOpenChange={setShowAddResource}
        onAdd={(data) => {
          createResourceMutation.mutate(
            { courseId, data },
            { onSuccess: () => setShowAddResource(false) }
          );
        }}
        isLoading={createResourceMutation.isPending}
      />

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
  const form = useForm({
    defaultValues: {
      lesson_number: nextLessonNumber as number | undefined,
      title: "" as string | undefined,
      start_time: "",
      end_time: "",
      room: "" as string | undefined,
    },
    validators: {
      onChange: scheduleFormValidator,
    },
    onSubmit: ({ value }) => {
      onAdd({
        lesson_number: value.lesson_number ?? nextLessonNumber,
        title: value.title ?? "",
        start_time: value.start_time,
        end_time: value.end_time,
        room: value.room ?? "",
      });
      form.reset();
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>添加课时</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <form.Field name="lesson_number">
              {(field) => (
                <FormTextField
                  field={field}
                  label="课时编号"
                  type="number"
                />
              )}
            </form.Field>

            <form.Field name="room">
              {(field) => (
                <FormTextField
                  field={field}
                  label="教室"
                  placeholder="例如: A-301"
                />
              )}
            </form.Field>
          </div>

          <form.Field name="title">
            {(field) => (
              <FormTextField
                field={field}
                label="课时标题"
                placeholder="例如: 矩阵基础"
              />
            )}
          </form.Field>

          <div className="grid grid-cols-2 gap-4">
            <form.Field name="start_time">
              {(field) => (
                <FormDateTimeField
                  field={field}
                  label="开始时间"
                  required
                />
              )}
            </form.Field>

            <form.Field name="end_time">
              {(field) => (
                <FormDateTimeField
                  field={field}
                  label="结束时间"
                  required
                />
              )}
            </form.Field>
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

// ── Add Assignment Dialog ─────────────────────────────

function AddAssignmentDialog({
  open,
  onOpenChange,
  onAdd,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onAdd: (data: { title: string; description?: string; due_date: string }) => void;
  isLoading: boolean;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;
    onAdd({ title: title.trim(), description: description.trim() || undefined, due_date: dueDate });
  };

  const handleClose = (v: boolean) => {
    if (!v) { setTitle(""); setDescription(""); setDueDate(""); }
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>添加作业</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="assignment-title">标题 *</Label>
            <Input
              id="assignment-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：第一章课后练习"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="assignment-desc">说明（可选）</Label>
            <Input
              id="assignment-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="作业内容说明"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="assignment-due">截止日期 *</Label>
            <Input
              id="assignment-due"
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleClose(false)}>取消</Button>
            <Button type="submit" disabled={isLoading || !title.trim() || !dueDate}>
              {isLoading ? "添加中..." : "添加作业"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Add Resource Dialog ───────────────────────────────

function AddResourceDialog({
  open,
  onOpenChange,
  onAdd,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onAdd: (data: { title: string; file_type?: string; file_size?: string; featured?: boolean }) => void;
  isLoading: boolean;
}) {
  const [title, setTitle] = useState("");
  const [fileType, setFileType] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [featured, setFeatured] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({
      title: title.trim(),
      file_type: fileType.trim() || undefined,
      file_size: fileSize.trim() || undefined,
      featured,
    });
  };

  const handleClose = (v: boolean) => {
    if (!v) { setTitle(""); setFileType(""); setFileSize(""); setFeatured(false); }
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>添加课程资源</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="res-title">资源名称 *</Label>
            <Input
              id="res-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：第一章讲义.pdf"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="res-type">文件类型</Label>
              <Input
                id="res-type"
                value={fileType}
                onChange={(e) => setFileType(e.target.value)}
                placeholder="pdf / ppt / doc"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="res-size">文件大小</Label>
              <Input
                id="res-size"
                value={fileSize}
                onChange={(e) => setFileSize(e.target.value)}
                placeholder="例如：2.5 MB"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="res-featured"
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="res-featured" className="cursor-pointer text-sm">设为精选资源</Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleClose(false)}>取消</Button>
            <Button type="submit" disabled={isLoading || !title.trim()}>
              {isLoading ? "添加中..." : "添加资源"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
