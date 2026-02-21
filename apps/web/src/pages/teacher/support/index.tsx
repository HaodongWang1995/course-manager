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
import { useForm } from "@tanstack/react-form";
import { supportSchema } from "@/lib/schemas";


function ContactForm() {
  const { t } = useTranslation();
  const [sent, setSent] = useState(false);

  const form = useForm({
    defaultValues: { subject: "", body: "" },
    validators: { onChange: supportSchema },
    onSubmit: () => {
      setSent(true);
      form.reset();
    },
  });

  if (sent) {
    return (
      <Card>
        <CardContent className="pt-6">
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
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("support.contactTitle")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}
          className="space-y-4"
        >
          <form.Field name="subject">
            {(field) => (
              <Input
                placeholder={t("support.subjectPlaceholder")}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
            )}
          </form.Field>
          <form.Field name="body">
            {(field) => (
              <textarea
                className="flex min-h-[100px] w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t("support.messagePlaceholder")}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
            )}
          </form.Field>
          <form.Subscribe selector={(s) => s.canSubmit}>
            {(canSubmit) => (
              <Button type="submit" disabled={!canSubmit}>
                {t("support.send")}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </CardContent>
    </Card>
  );
}

export function TeacherSupportPage() {
  const { t } = useTranslation();

  const teacherLinks = [
    { icon: BookOpen, title: t("support.teacher.links.docs.title"), desc: t("support.teacher.links.docs.desc"), color: "text-blue-600 bg-blue-50" },
    { icon: MessageCircle, title: t("support.teacher.links.chat.title"), desc: t("support.teacher.links.chat.desc"), color: "text-green-600 bg-green-50" },
    { icon: Mail, title: t("support.teacher.links.email.title"), desc: t("support.teacher.links.email.desc"), color: "text-purple-600 bg-purple-50" },
    { icon: FileText, title: t("support.teacher.links.release.title"), desc: t("support.teacher.links.release.desc"), color: "text-orange-600 bg-orange-50" },
  ];

  const teacherFaqs = [
    { q: t("support.teacher.faq.create.q"), a: t("support.teacher.faq.create.a") },
    { q: t("support.teacher.faq.enrollments.q"), a: t("support.teacher.faq.enrollments.a") },
    { q: t("support.teacher.faq.schedules.q"), a: t("support.teacher.faq.schedules.a") },
    { q: t("support.teacher.faq.reports.q"), a: t("support.teacher.faq.reports.a") },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t("support.title")}</h1>
        <p className="mt-1 text-sm text-gray-500">{t("support.teacherSubtitle")}</p>
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 sm:grid-cols-2">
        {teacherLinks.map((item) => (
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
          {teacherFaqs.map((faq, idx) => (
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

      <ContactForm />
    </div>
  );
}
