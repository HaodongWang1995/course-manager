import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@course-manager/ui";
import {
  Users,
  ClipboardCheck,
  BookOpen,
  Clock,
  BarChart3,
  TrendingUp,
  Construction,
} from "lucide-react";
import { useTeacherStats } from "@/hooks/use-queries";

function ChartPlaceholder({ title, description }: { title: string; description: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        <p className="text-sm text-gray-500">{description}</p>
      </CardHeader>
      <CardContent>
        <div className="flex h-52 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 text-center">
          <Construction className="h-10 w-10 text-gray-300" />
          <p className="mt-2 text-sm text-gray-400">图表分析功能即将上线</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function TeacherReportsPage() {
  const { data: stats, isLoading } = useTeacherStats();

  const kpiCards = [
    {
      title: "总课程数",
      value: isLoading ? "—" : (stats?.course_count ?? "0"),
      icon: BookOpen,
      color: "text-blue-600",
      iconBg: "bg-blue-100",
    },
    {
      title: "进行中课程",
      value: isLoading ? "—" : (stats?.active_courses ?? "0"),
      icon: TrendingUp,
      color: "text-emerald-600",
      iconBg: "bg-emerald-100",
    },
    {
      title: "选课学生数",
      value: isLoading ? "—" : (stats?.student_count ?? "0"),
      icon: Users,
      color: "text-violet-600",
      iconBg: "bg-violet-100",
    },
    {
      title: "待审核申请",
      value: isLoading ? "—" : (stats?.pending_enrollments ?? "0"),
      icon: Clock,
      color: "text-amber-600",
      iconBg: "bg-amber-100",
    },
    {
      title: "课程总课时",
      value: isLoading ? "—" : (stats?.schedule_count ?? "0"),
      icon: ClipboardCheck,
      color: "text-rose-600",
      iconBg: "bg-rose-100",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Reports & Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">Overview of your courses and students</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {kpiCards.map((kpi) => (
          <Card key={kpi.title}>
            <CardContent className="p-5">
              <div className={`inline-flex rounded-lg p-2.5 ${kpi.iconBg}`}>
                <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
              </div>
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-500">{kpi.title}</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{kpi.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartPlaceholder title="成绩分布" description="按课程的平均成绩分布" />
        <ChartPlaceholder title="出勤率趋势" description="各课程每周出勤率变化" />
      </div>

      {/* Reports list */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <BarChart3 className="h-4 w-4" />
            报告列表
          </CardTitle>
          <p className="text-sm text-gray-500">自动生成的课程分析报告将在此处显示</p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Construction className="h-12 w-12 text-gray-300" />
            <p className="mt-3 text-sm font-medium text-gray-500">报告生成功能正在开发中</p>
            <p className="mt-1 text-xs text-gray-400">敬请期待</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
