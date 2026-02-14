import { createFileRoute } from "@tanstack/react-router";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
} from "@course-manager/ui";
import {
  HelpCircle,
  BookOpen,
  MessageCircle,
  Mail,
  FileText,
  ExternalLink,
} from "lucide-react";

export const Route = createFileRoute("/(app)/student/support")({
  component: StudentSupport,
});

const faqs = [
  { q: "How do I enroll in a course?", a: "Browse courses from the Dashboard, open a course and click 'Apply to Enroll'. Your application will be reviewed by the teacher." },
  { q: "How do I check my grades?", a: "Go to Grades from the sidebar or bottom navigation to view your GPA, course grades, and performance overview." },
  { q: "How do I cancel an enrollment?", a: "Go to Enrollments, find the pending enrollment and click the cancel button." },
  { q: "How do I contact my teacher?", a: "Use the Messages feature from the sidebar to send a message to your course teacher." },
];

function StudentSupport() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Help & Support</h1>
        <p className="mt-1 text-sm text-gray-500">
          Get help with using EduPortal
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { icon: BookOpen, title: "Student Guide", desc: "Getting started tutorials", color: "text-blue-600 bg-blue-50" },
          { icon: MessageCircle, title: "Live Chat", desc: "Chat with support team", color: "text-green-600 bg-green-50" },
          { icon: Mail, title: "Email Support", desc: "support@eduportal.com", color: "text-purple-600 bg-purple-50" },
          { icon: FileText, title: "Knowledge Base", desc: "Browse help articles", color: "text-orange-600 bg-orange-50" },
        ].map((item) => (
          <Card key={item.title} className="cursor-pointer transition-shadow hover:shadow-md">
            <CardContent className="flex items-start gap-3 p-4">
              <div className={`rounded-lg p-2 ${item.color}`}>
                <item.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900">{item.title}</h3>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
              <ExternalLink className="h-4 w-4 text-gray-400" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <HelpCircle className="h-4 w-4" />
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {faqs.map((faq, idx) => (
            <details key={idx} className="group rounded-lg border border-gray-100 p-3">
              <summary className="cursor-pointer text-sm font-medium text-gray-900 list-none flex items-center justify-between">
                {faq.q}
                <span className="text-gray-400 group-open:rotate-180 transition-transform">&#9662;</span>
              </summary>
              <p className="mt-2 text-sm text-gray-600">{faq.a}</p>
            </details>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Send us a message</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Subject" />
          <textarea
            className="flex min-h-[100px] w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe your issue or question..."
          />
          <Button>Send Message</Button>
        </CardContent>
      </Card>
    </div>
  );
}
