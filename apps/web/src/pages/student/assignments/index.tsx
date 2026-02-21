import {
  Card,
  CardContent,
  Badge,
  Progress,
} from "@course-manager/ui";
import {
  Search,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Upload,
  Paperclip,
  ChevronRight,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useStudentAssignments, useUpdateAssignmentStatus } from "@/hooks/use-queries";

const courseColors: Record<string, string> = {
  "Math 101 • Algebra": "bg-blue-500",
  "History 204": "bg-amber-500",
  "Physics 101": "bg-purple-500",
  "Literature": "bg-emerald-500",
  "CS 101": "bg-red-500",
};

export function StudentAssignmentsPage() {
  const { t } = useTranslation("studentAssignments");
  const { data: assignments = [] } = useStudentAssignments();
  const updateStatus = useUpdateAssignmentStatus();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered = useMemo(() => {
    return assignments.filter((a) => {
      const st = a.status || a.submission_status || "";
      const course = a.course || a.course_title || "";
      const matchesSearch = !searchQuery ||
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter =
        activeFilter === "All" ||
        (activeFilter === "To Do" && st === "todo") ||
        (activeFilter === "In Progress" && st === "in-progress") ||
        (activeFilter === "Completed" && st === "completed");
      return matchesSearch && matchesFilter;
    });
  }, [assignments, searchQuery, activeFilter]);

  const todoCount = assignments.filter((a) => (a.status || a.submission_status) === "todo").length;
  const urgentAssignment = assignments.find((a) => a.urgent && (a.status || a.submission_status) === "todo");

  const filterTabs = [
    { key: "All", label: t("filters.all"), count: null },
    { key: "To Do", label: t("filters.todo"), count: todoCount || null },
    { key: "In Progress", label: t("filters.inProgress"), count: null },
    { key: "Completed", label: t("filters.completed"), count: null },
  ];

  const handleAction = (id: string, currentStatus: string) => {
    if (currentStatus === "todo") {
      updateStatus.mutate({ id, status: "in-progress" });
    } else if (currentStatus === "in-progress" || currentStatus === "late") {
      updateStatus.mutate({ id, status: "completed" });
    }
  };

  const getAction = (status: string) => {
    if (status === "todo") return t("actions.start");
    if (status === "in-progress") return t("actions.continue");
    if (status === "late") return t("actions.submitLate");
    return null;
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder={t("searchPlaceholder")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              activeFilter === tab.key
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {tab.label}
            {tab.count && (
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                  activeFilter === tab.key ? "bg-white/20 text-white" : "bg-red-100 text-red-600"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Priority Hero - Due Soon */}
      {urgentAssignment && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-700 via-indigo-700 to-violet-800 p-5 shadow-lg">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.08)_0%,transparent_60%)]" />
          <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-red-500 px-2.5 py-1 shadow-sm">
            <AlertTriangle className="h-3 w-3 text-white" />
            <span className="text-[11px] font-bold text-white">{urgentAssignment.dueLabel}</span>
          </div>
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-200">
            {urgentAssignment.course}
          </p>
          <h3 className="mt-1.5 text-xl font-bold leading-snug text-white pr-28">
            {urgentAssignment.title}
          </h3>
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-blue-200">
            <Clock className="h-3.5 w-3.5" />
            <span>{t("priority")}</span>
          </div>
          <button
            onClick={() => handleAction(urgentAssignment.id, urgentAssignment.status || urgentAssignment.submission_status || "")}
            className="mt-4 flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-indigo-700 shadow-md transition-all hover:bg-blue-50 active:scale-[0.98]"
          >
            <Upload className="h-4 w-4" />
            {t("submitNow")}
          </button>
        </div>
      )}

      {/* This Week */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">{t("thisWeek")}</h2>
          <ChevronRight className="h-4 w-4 text-gray-400" />
        </div>

        <div className="space-y-3">
          {filtered.map((assignment) => {
            const assignmentStatus = assignment.status || assignment.submission_status || "";
            const action = getAction(assignmentStatus);
            const courseTitle = assignment.course || assignment.course_title || "";
            const colorKey = Object.keys(courseColors).find((k) =>
              courseTitle.includes(k) || k.includes(courseTitle)
            );
            const courseColor = courseColors[colorKey || ""] || "bg-gray-500";

            return (
              <Card key={assignment.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 h-10 w-1 shrink-0 rounded-full ${courseColor}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-gray-500">{courseTitle}</span>
                        {assignmentStatus === "in-progress" && (
                          <Badge variant="default" className="bg-blue-100 text-blue-700 border-none text-[10px]">
                            {t("status.inProgress")}
                          </Badge>
                        )}
                        {assignmentStatus === "completed" && (
                          <Badge variant="success" className="text-[10px]">{t("status.done")}</Badge>
                        )}
                        {assignmentStatus === "late" && (
                          <Badge variant="destructive" className="text-[10px]">{t("status.late")}</Badge>
                        )}
                      </div>
                      <h3 className="mt-1 text-sm font-semibold text-gray-900">{assignment.title}</h3>
                      {"description" in assignment && assignment.description && (
                        <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                          {assignment.description as string}
                        </p>
                      )}
                      {"progress" in assignment && typeof assignment.progress === "number" && (
                        <div className="mt-2 flex items-center gap-2">
                          <Progress value={assignment.progress} className="h-1.5 flex-1" />
                          <span className="text-xs font-medium text-gray-500">{assignment.progress}%</span>
                        </div>
                      )}
                      <div className="mt-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Clock className="h-3 w-3" />
                            <span>{assignment.dueLabel}</span>
                          </div>
                          {"filesAttached" in assignment && assignment.filesAttached && (
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <Paperclip className="h-3 w-3" />
                              <span>{assignment.filesAttached as number} files</span>
                            </div>
                          )}
                        </div>
                        {action && (
                          <button
                            onClick={() => handleAction(assignment.id, assignmentStatus)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                              assignmentStatus === "late"
                                ? "bg-red-600 text-white hover:bg-red-700"
                                : assignmentStatus === "in-progress"
                                  ? "bg-blue-600 text-white hover:bg-blue-700"
                                  : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {action}
                          </button>
                        )}
                        {assignmentStatus === "completed" && (
                          <div className="flex items-center gap-1 text-xs font-medium text-green-600">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>{t("status.submitted")}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
