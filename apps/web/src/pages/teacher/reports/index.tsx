import { useTranslation } from "react-i18next";
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
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useTeacherStats } from "@/hooks/use-queries";

const COURSE_COLORS = ["#3b82f6", "#d1d5db"]; // blue-500, gray-300
const ENROLLMENT_COLORS = ["#10b981", "#f59e0b"]; // emerald-500, amber-500

export function TeacherReportsPage() {
  const { t } = useTranslation("teacherReports");
  const { data: stats, isLoading } = useTeacherStats();

  const courseCount = Number(stats?.course_count ?? 0);
  const activeCourses = Number(stats?.active_courses ?? 0);
  const studentCount = Number(stats?.student_count ?? 0);
  const pendingEnrollments = Number(stats?.pending_enrollments ?? 0);
  const scheduleCount = Number(stats?.schedule_count ?? 0);

  const courseStatusData = [
    { name: t("charts.active"), value: activeCourses },
    { name: t("charts.inactive"), value: Math.max(0, courseCount - activeCourses) },
  ];

  const enrollmentData = [
    { name: t("charts.approved"), value: studentCount },
    { name: t("charts.pending"), value: pendingEnrollments },
  ];

  const avgStudents = activeCourses > 0 ? (studentCount / activeCourses).toFixed(1) : "—";
  const activeRate = courseCount > 0 ? `${Math.round((activeCourses / courseCount) * 100)}%` : "—";
  const avgLessons = courseCount > 0 ? (scheduleCount / courseCount).toFixed(1) : "—";
  const totalApps = studentCount + pendingEnrollments;
  const approvalRate = totalApps > 0 ? `${Math.round((studentCount / totalApps) * 100)}%` : "—";

  const kpiCards = [
    {
      title: t("kpi.totalCourses"),
      value: isLoading ? "—" : (stats?.course_count ?? "0"),
      icon: BookOpen,
      color: "text-blue-600",
      iconBg: "bg-blue-100",
    },
    {
      title: t("kpi.activeCourses"),
      value: isLoading ? "—" : (stats?.active_courses ?? "0"),
      icon: TrendingUp,
      color: "text-emerald-600",
      iconBg: "bg-emerald-100",
    },
    {
      title: t("kpi.enrolledStudents"),
      value: isLoading ? "—" : (stats?.student_count ?? "0"),
      icon: Users,
      color: "text-violet-600",
      iconBg: "bg-violet-100",
    },
    {
      title: t("kpi.pendingApplications"),
      value: isLoading ? "—" : (stats?.pending_enrollments ?? "0"),
      icon: Clock,
      color: "text-amber-600",
      iconBg: "bg-amber-100",
    },
    {
      title: t("kpi.totalLessons"),
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
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">{t("title")}</h1>
        <p className="mt-1 text-sm text-gray-500">{t("subtitle")}</p>
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
        {/* Course Status — Donut Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">{t("charts.gradeDistribution")}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-52 items-center justify-center">
                <p className="text-sm text-gray-400">{t("loading")}</p>
              </div>
            ) : courseCount === 0 ? (
              <div className="flex h-52 items-center justify-center">
                <p className="text-sm text-gray-400">{t("noData")}</p>
              </div>
            ) : (
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={courseStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={76}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {courseStatusData.map((_, idx) => (
                        <Cell key={idx} fill={COURSE_COLORS[idx % COURSE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enrollment Overview — Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">{t("charts.attendanceTrend")}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-52 items-center justify-center">
                <p className="text-sm text-gray-400">{t("loading")}</p>
              </div>
            ) : (
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={enrollmentData} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={60}>
                      {enrollmentData.map((_, idx) => (
                        <Cell key={idx} fill={ENROLLMENT_COLORS[idx % ENROLLMENT_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <BarChart3 className="h-4 w-4" />
            {t("reportList.title")}
          </CardTitle>
          <p className="text-sm text-gray-500">{t("reportList.autoGenDesc")}</p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-gray-400">{t("loading")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: t("reportList.avgStudents"), value: avgStudents },
                { label: t("reportList.activeRate"), value: activeRate },
                { label: t("reportList.avgLessons"), value: avgLessons },
                { label: t("reportList.approvalRate"), value: approvalRate },
              ].map((insight) => (
                <div key={insight.label} className="rounded-lg bg-gray-50 p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">{insight.value}</p>
                  <p className="mt-1 text-xs text-gray-500">{insight.label}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
