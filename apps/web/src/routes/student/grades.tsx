import { createFileRoute } from "@tanstack/react-router";
import { KpiCard, Badge, Card, CardContent, CardHeader, CardTitle } from "@course-manager/ui";
import { ChevronRight, TrendingUp, Filter } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export const Route = createFileRoute("/student/grades")({
  component: StudentGrades,
});

const performanceData = [
  { subject: "Math", you: 95, avg: 78 },
  { subject: "Sci", you: 88, avg: 82 },
  { subject: "Hist", you: 92, avg: 75 },
  { subject: "Eng", you: 85, avg: 80 },
  { subject: "Art", you: 90, avg: 85 },
];

const courses = [
  {
    id: "math-101",
    name: "Mathematics 101",
    teacher: "Mr. Anderson",
    grade: 95,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    ringColor: "stroke-blue-600",
    midterm: { label: "A", score: 92 },
    final: { label: "A+", score: 98 },
  },
  {
    id: "physics-adv",
    name: "Advanced Physics",
    teacher: "Ms. Roberts",
    grade: 88,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    ringColor: "stroke-purple-600",
    midterm: { label: "B+", score: 89 },
    final: { label: "B", score: 87 },
  },
  {
    id: "history-world",
    name: "World History",
    teacher: "Mr. Lewis",
    grade: 92,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    ringColor: "stroke-emerald-600",
    midterm: { label: "A-", score: 91 },
    final: { label: "A", score: 93 },
  },
];

function CircularProgress({
  percentage,
  ringColor,
  color,
}: {
  percentage: number;
  ringColor: string;
  color: string;
}) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex h-20 w-20 items-center justify-center">
      <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="6"
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          className={ringColor}
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className={`absolute text-lg font-bold ${color}`}>{percentage}%</span>
    </div>
  );
}

function StudentGrades() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Gradebook</h1>
          <button className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
            <Filter className="h-3.5 w-3.5" />
            Filter
          </button>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            Showing: Fall 2023
          </Badge>
          <Badge variant="outline" className="text-xs">
            Full Year
          </Badge>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-3">
        <KpiCard
          value="3.8"
          label="GPA"
          trend={{ value: "+0.2", positive: true }}
        />
        <KpiCard
          value="5th"
          label="Class Rank"
          trend={{ value: "+2", positive: true }}
        />
        <KpiCard
          value="92%"
          label="Completion"
          trend={{ value: "+5%", positive: true }}
        />
      </div>

      {/* Performance Overview Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Performance Overview</CardTitle>
          <p className="text-xs text-gray-500">Your scores vs class average</p>
        </CardHeader>
        <CardContent>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={performanceData}
                margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
                barGap={4}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis
                  dataKey="subject"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    fontSize: "12px",
                  }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: "12px", paddingBottom: "8px" }}
                />
                <Bar dataKey="you" name="You" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="avg" name="Avg" fill="#d1d5db" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Courses Section */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Courses</h2>
          <button className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700">
            View All
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-3">
          {courses.map((course) => (
            <Card key={course.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Circular Progress */}
                  <CircularProgress
                    percentage={course.grade}
                    ringColor={course.ringColor}
                    color={course.color}
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {course.name}
                    </h3>
                    <p className="mt-0.5 text-xs text-gray-500">{course.teacher}</p>

                    <div className="mt-2 flex items-center gap-3">
                      <div className={`rounded-lg ${course.bgColor} px-2.5 py-1`}>
                        <span className="text-[10px] text-gray-500 block">Midterm</span>
                        <span className={`text-sm font-bold ${course.color}`}>
                          {course.midterm.label}
                          <span className="ml-0.5 text-xs font-normal text-gray-400">
                            ({course.midterm.score})
                          </span>
                        </span>
                      </div>
                      <div className={`rounded-lg ${course.bgColor} px-2.5 py-1`}>
                        <span className="text-[10px] text-gray-500 block">Final</span>
                        <span className={`text-sm font-bold ${course.color}`}>
                          {course.final.label}
                          <span className="ml-0.5 text-xs font-normal text-gray-400">
                            ({course.final.score})
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* View Breakdown */}
                  <button className="shrink-0 text-xs font-medium text-blue-600 hover:text-blue-700">
                    View Breakdown
                    <ChevronRight className="ml-0.5 inline h-3 w-3" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
