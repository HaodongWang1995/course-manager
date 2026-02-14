import { createFileRoute, useParams } from "@tanstack/react-router";
import { Card, CardContent, Badge, Checkbox } from "@course-manager/ui";
import {
  ArrowLeft,
  Clock,
  User,
  Building2,
  CheckCircle2,
  FileText,
  Download,
  MessageSquare,
  AlertCircle,
  BookOpen,
} from "lucide-react";

export const Route = createFileRoute("/(app)/student/feedback/$courseId")({
  component: StudentFeedbackDetail,
});

const preClassRequirements = [
  { id: "req-1", label: "Read Chapter 4: Quadratic Formulas", completed: true },
  { id: "req-2", label: "Install Graphing Calculator App", completed: true },
];

const actionItems = [
  {
    id: "action-1",
    label: "Complete Practice Set 4B (Problems 1-15)",
    due: "Oct 26, 2023",
    completed: false,
  },
  {
    id: "action-2",
    label: "Watch supplementary video on polynomial roots",
    due: "Oct 27, 2023",
    completed: false,
  },
];

const resources = [
  {
    id: "res-1",
    name: "Lecture_Slides_Week4.pdf",
    size: "2.4MB",
    type: "PDF",
  },
  {
    id: "res-2",
    name: "Homework_Sheet_4B.docx",
    size: "856KB",
    type: "DOCX",
  },
];

function StudentFeedbackDetail() {
  const { courseId } = useParams({ from: "/student/feedback/$courseId" });

  return (
    <div className="mx-auto max-w-lg space-y-5 pb-24">
      {/* Top Navigation Bar */}
      <div className="flex items-center gap-3">
        <a
          href="/student"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-gray-600" />
        </a>
        <h1 className="text-lg font-bold text-gray-900">Feedback Detail</h1>
      </div>

      {/* Class Header Card */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">
                Advanced Mathematics 101
              </h2>
              <div className="mt-2 space-y-1.5">
                <div className="flex items-center gap-2 text-sm text-blue-100">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Oct 24, 2:00 PM - 3:30 PM</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-blue-100">
                  <User className="h-3.5 w-3.5" />
                  <span>Prof. Sarah Jenkins</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-blue-100">
                  <Building2 className="h-3.5 w-3.5" />
                  <span>Mathematics Department</span>
                </div>
              </div>
            </div>
            <Badge variant="success" className="shrink-0">
              Completed
            </Badge>
          </div>
        </div>
      </Card>

      {/* Pre-class Requirements */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-blue-900">
              Pre-class Requirements
            </h3>
          </div>
          <div className="space-y-3">
            {preClassRequirements.map((req) => (
              <div key={req.id} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                </div>
                <span className="text-sm text-gray-700 line-through decoration-gray-400">
                  {req.label}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Class Summary / Feedback */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Class Summary
          </h3>
          <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
            <p>
              Great session today! We covered the fundamentals of quadratic equations
              and explored various methods of solving them, including factoring,
              completing the square, and the quadratic formula.
            </p>
            <p>
              Most students demonstrated strong understanding of factoring
              techniques. A few areas that need additional practice include
              identifying the discriminant and understanding how it affects the
              nature of roots.
            </p>
            <div className="rounded-lg border-l-4 border-blue-400 bg-blue-50 p-3">
              <p className="text-sm text-blue-800 italic">
                "Remember: The discriminant (b² - 4ac) tells you everything about
                the roots. Positive means two real roots, zero means one repeated
                root, and negative means complex roots."
              </p>
            </div>
            <p>
              Next class, we will build on this foundation and move into graphing
              quadratic functions and analyzing their properties.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Items */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Action Items</h3>
            <Badge variant="warning" className="text-[10px]">
              2 Pending
            </Badge>
          </div>
          <div className="space-y-3">
            {actionItems.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3"
              >
                <div className="mt-0.5">
                  <div className="h-4 w-4 rounded border-2 border-gray-300 bg-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{item.label}</p>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-400">
                    <Clock className="h-3 w-3" />
                    <span>Due: {item.due}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resources */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Resources</h3>
          <div className="space-y-2">
            {resources.map((res) => (
              <div
                key={res.id}
                className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50">
                  <FileText
                    className={`h-5 w-5 ${
                      res.type === "PDF" ? "text-red-500" : "text-blue-500"
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {res.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {res.type} - {res.size}
                  </p>
                </div>
                <button className="shrink-0 rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                  <Download className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sticky Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white p-4 lg:hidden">
        <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-blue-700 transition-colors">
          <MessageSquare className="h-4 w-4" />
          Message Teacher
        </button>
      </div>

      {/* Desktop CTA */}
      <div className="hidden lg:block">
        <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors">
          <MessageSquare className="h-4 w-4" />
          Message Teacher
        </button>
      </div>
    </div>
  );
}
