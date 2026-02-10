import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Badge,
  Input,
  Label,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Progress,
  Avatar,
  AvatarFallback,
  Separator,
} from "@course-manager/ui";
import {
  ArrowLeft,
  Edit,
  Save,
  Users,
  BookOpen,
  Calendar,
  FileText,
  Settings,
  Plus,
  MoreVertical,
  Trash2,
} from "lucide-react";
import { useTeacherCourses } from "@/hooks/use-queries";

export const Route = createFileRoute("/teacher/courses/$courseId")({
  component: CourseDetailPage,
});

function CourseDetailPage() {
  const { courseId } = Route.useParams();
  const navigate = useNavigate();
  const { data: courses = [] } = useTeacherCourses();
  const course = courses.find((c) => c.code === courseId);

  const [isEditing, setIsEditing] = useState(false);
  const [editedCourse, setEditedCourse] = useState(
    course || {
      code: "",
      name: "",
      section: "",
      studentCount: 0,
      lessonCount: 0,
      progress: 0,
    }
  );

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-gray-500">课程未找到</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate({ to: "/teacher/courses" })}
        >
          返回课程列表
        </Button>
      </div>
    );
  }

  const handleSave = () => {
    // TODO: 实现保存逻辑
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: "/teacher/courses" })}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          {isEditing ? (
            <Input
              value={editedCourse.name}
              onChange={(e) =>
                setEditedCourse({ ...editedCourse, name: e.target.value })
              }
              className="text-2xl font-bold"
            />
          ) : (
            <h1 className="text-2xl font-bold text-gray-900">{course.name}</h1>
          )}
          <div className="mt-1 flex items-center gap-2">
            <Badge variant="default">{course.code}</Badge>
            {isEditing ? (
              <Input
                value={editedCourse.section}
                onChange={(e) =>
                  setEditedCourse({ ...editedCourse, section: e.target.value })
                }
                className="w-auto text-sm"
              />
            ) : (
              <span className="text-sm text-gray-500">{course.section}</span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                取消
              </Button>
              <Button onClick={handleSave} className="gap-2">
                <Save className="h-4 w-4" />
                保存
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="mr-2 h-4 w-4" />
                编辑
              </Button>
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                添加学生
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              学生总数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-gray-400" />
              <div className="text-2xl font-bold text-gray-900">
                {course.studentCount}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              课程总数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-gray-400" />
              <div className="text-2xl font-bold text-gray-900">
                {course.lessonCount}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              课程进度
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {course.progress}%
            </div>
            <Progress value={course.progress} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="students">学生</TabsTrigger>
          <TabsTrigger value="lessons">课程</TabsTrigger>
          <TabsTrigger value="assignments">作业</TabsTrigger>
          <TabsTrigger value="settings">设置</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>课程信息</CardTitle>
              <CardDescription>课程的基本信息和统计</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>课程代码</Label>
                  <div className="mt-1 text-sm text-gray-900">{course.code}</div>
                </div>
                <div>
                  <Label>课程名称</Label>
                  <div className="mt-1 text-sm text-gray-900">{course.name}</div>
                </div>
                <div>
                  <Label>上课时间</Label>
                  <div className="mt-1 text-sm text-gray-900">
                    {course.section}
                  </div>
                </div>
                <div>
                  <Label>课程进度</Label>
                  <div className="mt-1">
                    <Progress value={course.progress} />
                    <div className="mt-1 text-sm text-gray-500">
                      {course.progress}% 完成
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>最近活动</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    action: "新作业已发布",
                    time: "2小时前",
                    user: "系统",
                  },
                  {
                    action: "学生提交了作业",
                    time: "5小时前",
                    user: "Alice Johnson",
                  },
                  {
                    action: "课程资料已更新",
                    time: "1天前",
                    user: "系统",
                  },
                ].map((activity, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                      {activity.user.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.action}
                      </p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>学生列表</CardTitle>
                  <CardDescription>
                    共有 {course.studentCount} 名学生
                  </CardDescription>
                </div>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  添加学生
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: "Alice Johnson", email: "alice@example.com", attendance: 98 },
                  { name: "Bob Smith", email: "bob@example.com", attendance: 85 },
                  { name: "Charlie Williams", email: "charlie@example.com", attendance: 92 },
                ].map((student, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg border border-gray-100 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {student.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {student.name}
                        </p>
                        <p className="text-xs text-gray-500">{student.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          出勤率 {student.attendance}%
                        </p>
                        <p className="text-xs text-gray-500">本学期</p>
                      </div>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lessons" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>课程安排</CardTitle>
                  <CardDescription>
                    共有 {course.lessonCount} 节课
                  </CardDescription>
                </div>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  添加课程
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    title: "第1课：课程介绍",
                    date: "2024-01-15",
                    time: "09:00 - 10:30",
                    status: "completed",
                  },
                  {
                    title: "第2课：基础知识",
                    date: "2024-01-22",
                    time: "09:00 - 10:30",
                    status: "completed",
                  },
                  {
                    title: "第3课：进阶内容",
                    date: "2024-01-29",
                    time: "09:00 - 10:30",
                    status: "upcoming",
                  },
                ].map((lesson, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg border border-gray-100 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-sm font-semibold text-blue-700">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {lesson.title}
                        </p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          <span>{lesson.date}</span>
                          <span>•</span>
                          <span>{lesson.time}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          lesson.status === "completed" ? "default" : "outline"
                        }
                      >
                        {lesson.status === "completed" ? "已完成" : "即将开始"}
                      </Badge>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>作业管理</CardTitle>
                  <CardDescription>查看和管理课程作业</CardDescription>
                </div>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  创建作业
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    title: "作业1：基础练习",
                    dueDate: "2024-02-05",
                    submissions: 28,
                    total: course.studentCount,
                  },
                  {
                    title: "作业2：项目报告",
                    dueDate: "2024-02-12",
                    submissions: 15,
                    total: course.studentCount,
                  },
                ].map((assignment, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg border border-gray-100 p-4"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {assignment.title}
                      </p>
                      <div className="mt-1 flex items-center gap-4 text-xs text-gray-500">
                        <span>截止日期: {assignment.dueDate}</span>
                        <span>
                          提交: {assignment.submissions}/{assignment.total}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        查看
                      </Button>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>课程设置</CardTitle>
              <CardDescription>管理课程的基本设置</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>课程代码</Label>
                <Input value={course.code} disabled />
              </div>
              <div className="space-y-2">
                <Label>课程名称</Label>
                <Input value={course.name} />
              </div>
              <div className="space-y-2">
                <Label>上课时间</Label>
                <Input value={course.section} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">删除课程</p>
                  <p className="text-xs text-gray-500">
                    删除后无法恢复，请谨慎操作
                  </p>
                </div>
                <Button variant="destructive" className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  删除课程
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
