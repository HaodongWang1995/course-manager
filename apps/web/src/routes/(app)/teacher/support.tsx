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
  CheckCircle,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/(app)/teacher/support")({
  component: TeacherSupport,
});

const teacherFaqKeys = [
  { q: "How do I create a new course?", a: "Go to Courses > click 'New Course' button > fill in the course details and submit." },
  { q: "How do I manage enrollments?", a: "Navigate to Enrollments from the sidebar. You can approve or reject student enrollment requests." },
  { q: "How do I add schedules to a course?", a: "Open a course detail page and click 'Add Schedule' to create class sessions." },
  { q: "How do I export reports?", a: "Go to Reports and click 'Generate New Report' or download existing reports as PDF." },
];

function TeacherSupport() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t("support.title")}</h1>
        <p className="mt-1 text-sm text-gray-500">{t("support.teacherSubtitle")}</p>
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { icon: BookOpen, title: "Documentation", desc: "Browse guides and tutorials", color: "text-blue-600 bg-blue-50" },
          { icon: MessageCircle, title: "Live Chat", desc: "Chat with our support team", color: "text-green-600 bg-green-50" },
          { icon: Mail, title: "Email Support", desc: "support@edumanager.com", color: "text-purple-600 bg-purple-50" },
          { icon: FileText, title: "Release Notes", desc: "See what's new", color: "text-orange-600 bg-orange-50" },
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

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <HelpCircle className="h-4 w-4" />
            {t("support.faq")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {teacherFaqKeys.map((faq, idx) => (
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

      {/* Contact Form */}
      <ContactForm />
    </div>
  );
}

function ContactForm() {
  const { t } = useTranslation();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!subject.trim() || !body.trim()) return;
    setSent(true);
    setSubject("");
    setBody("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("support.contactTitle")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sent ? (
          <div className="flex items-center gap-3 rounded-lg bg-emerald-50 px-4 py-3">
            <CheckCircle className="h-5 w-5 shrink-0 text-emerald-500" />
            <div>
              <p className="text-sm font-medium text-emerald-700">{t("support.sentTitle")}</p>
              <p className="text-xs text-emerald-600">{t("support.sentDesc")}</p>
            </div>
            <button
              className="ml-auto text-xs text-emerald-600 hover:underline"
              onClick={() => setSent(false)}
            >
              {t("support.sendAnother")}
            </button>
          </div>
        ) : (
          <>
            <Input
              placeholder={t("support.subjectPlaceholder")}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
            <textarea
              className="flex min-h-[100px] w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t("support.messagePlaceholder")}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
            <Button onClick={handleSend} disabled={!subject.trim() || !body.trim()}>
              {t("support.send")}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
