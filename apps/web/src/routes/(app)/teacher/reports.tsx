import { createFileRoute } from "@tanstack/react-router";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
} from "@course-manager/ui";
import {
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  ClipboardCheck,
  MessageSquare,
  Download,
  Plus,
  Calendar,
  Eye,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";

export const Route = createFileRoute("/(app)/teacher/reports")({
  component: TeacherReports,
});

const kpiCards = [
  {
    title: "Average Grade",
    value: "B+ (87%)",
    change: "+2.4%",
    trend: "up" as const,
    icon: FileText,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    iconBg: "bg-blue-100",
  },
  {
    title: "Active Students",
    value: "142",
    change: "+12",
    trend: "up" as const,
    icon: Users,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    iconBg: "bg-emerald-100",
  },
  {
    title: "Submission Rate",
    value: "94.5%",
    change: "0%",
    trend: "neutral" as const,
    icon: ClipboardCheck,
    color: "text-violet-600",
    bgColor: "bg-violet-50",
    iconBg: "bg-violet-100",
  },
  {
    title: "Feedback Pending",
    value: "18",
    change: "-5%",
    trend: "down" as const,
    icon: MessageSquare,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    iconBg: "bg-amber-100",
  },
];

const performanceData = [
  { course: "Math 101", avgGrade: 85, students: 38 },
  { course: "Physics 202", avgGrade: 78, students: 32 },
  { course: "Calculus II", avgGrade: 82, students: 41 },
  { course: "Comp Sci 101", avgGrade: 91, students: 31 },
  { course: "Stats 301", avgGrade: 74, students: 28 },
];

const feedbackPieData = [
  { name: "Completed", value: 75, color: "#10b981" },
  { name: "In Progress", value: 15, color: "#f59e0b" },
  { name: "Not Started", value: 10, color: "#e5e7eb" },
];

const attendanceTrendsData = [
  { week: "Week 1", math101: 95, physics202: 88, calculus2: 92 },
  { week: "Week 2", math101: 93, physics202: 85, calculus2: 90 },
  { week: "Week 3", math101: 90, physics202: 82, calculus2: 88 },
  { week: "Week 4", math101: 92, physics202: 80, calculus2: 85 },
  { week: "Week 5", math101: 88, physics202: 78, calculus2: 87 },
  { week: "Week 6", math101: 91, physics202: 83, calculus2: 89 },
  { week: "Week 7", math101: 94, physics202: 86, calculus2: 91 },
  { week: "Week 8", math101: 89, physics202: 81, calculus2: 86 },
];

const generatedReports = [
  {
    id: 1,
    name: "Fall Midterm Analysis",
    date: "Oct 18, 2023",
    type: "Performance",
    status: "Completed",
    pages: 12,
  },
  {
    id: 2,
    name: "Student Attendance Log",
    date: "Oct 15, 2023",
    type: "Attendance",
    status: "Completed",
    pages: 8,
  },
  {
    id: 3,
    name: "Department KPI Q3",
    date: "Oct 10, 2023",
    type: "KPI",
    status: "Completed",
    pages: 15,
  },
  {
    id: 4,
    name: "Course Feedback Summary",
    date: "Oct 5, 2023",
    type: "Feedback",
    status: "Completed",
    pages: 6,
  },
];

function getStatusBadge(status: string) {
  switch (status) {
    case "Completed":
      return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Completed</Badge>;
    case "In Progress":
      return <Badge className="bg-amber-50 text-amber-700 border-amber-200">In Progress</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

function getTypeBadge(type: string) {
  const colors: Record<string, string> = {
    Performance: "bg-blue-50 text-blue-700 border-blue-200",
    Attendance: "bg-violet-50 text-violet-700 border-violet-200",
    KPI: "bg-rose-50 text-rose-700 border-rose-200",
    Feedback: "bg-teal-50 text-teal-700 border-teal-200",
  };
  return <Badge className={colors[type] || ""}>{type}</Badge>;
}

function TeacherReports() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Reports & Analytics
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Track performance, attendance, and student progress
              </p>
            </div>
            <Badge className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
              Fall 2023
            </Badge>
          </div>
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            Generate New Report
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpiCards.map((kpi) => (
            <Card key={kpi.title}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{kpi.title}</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">{kpi.value}</p>
                    <div className="mt-1 flex items-center gap-1">
                      {kpi.trend === "up" && (
                        <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                      )}
                      {kpi.trend === "down" && (
                        <TrendingDown className="h-3.5 w-3.5 text-emerald-500" />
                      )}
                      <span
                        className={`text-xs font-medium ${
                          kpi.trend === "up"
                            ? "text-emerald-600"
                            : kpi.trend === "down"
                              ? "text-emerald-600"
                              : "text-gray-500"
                        }`}
                      >
                        {kpi.change}
                      </span>
                      <span className="text-xs text-gray-400">vs last semester</span>
                    </div>
                  </div>
                  <div className={`rounded-lg p-2.5 ${kpi.iconBg}`}>
                    <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Performance Bar Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Average Grade by Course
              </CardTitle>
              <p className="text-sm text-gray-500">
                Current semester performance across all courses
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceData} barSize={40}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis
                      dataKey="course"
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid #e5e7eb",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                      formatter={(value: number) => [`${value}%`, "Avg Grade"]}
                    />
                    <Bar dataKey="avgGrade" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Feedback Completion Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Feedback Completion
              </CardTitle>
              <p className="text-sm text-gray-500">Overall feedback status</p>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={feedbackPieData}
                      cx="50%"
                      cy="45%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {feedbackPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid #e5e7eb",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                      formatter={(value: number) => [`${value}%`, ""]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 flex items-center justify-center gap-4">
                {feedbackPieData.map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs text-gray-600">
                      {item.name} ({item.value}%)
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Trends Line Chart */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Attendance Trends
            </CardTitle>
            <p className="text-sm text-gray-500">
              Weekly attendance rates across courses
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attendanceTrendsData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis
                    dataKey="week"
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[70, 100]}
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value: number) => [`${value}%`]}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: "12px", paddingBottom: "12px" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="math101"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                    name="Math 101"
                  />
                  <Line
                    type="monotone"
                    dataKey="physics202"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                    name="Physics 202"
                  />
                  <Line
                    type="monotone"
                    dataKey="calculus2"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                    name="Calculus II"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Generated Reports Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">
                Generated Reports
              </CardTitle>
              <p className="mt-1 text-sm text-gray-500">
                Previously generated reports available for download
              </p>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Filter by Date
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-t border-gray-200 bg-gray-50/80">
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Report Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Date Generated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Pages
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {generatedReports.map((report) => (
                    <tr key={report.id} className="transition-colors hover:bg-gray-50/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {report.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {report.date}
                      </td>
                      <td className="px-6 py-4">{getTypeBadge(report.type)}</td>
                      <td className="px-6 py-4">{getStatusBadge(report.status)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {report.pages} pages
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" className="h-8 gap-1 text-blue-600 hover:text-blue-800">
                            <Eye className="h-3.5 w-3.5" />
                            View
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 gap-1 text-gray-600 hover:text-gray-800">
                            <Download className="h-3.5 w-3.5" />
                            PDF
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
