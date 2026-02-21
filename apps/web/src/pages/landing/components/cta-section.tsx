import { Link } from "@tanstack/react-router";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Avatar,
  AvatarFallback,
  Button,
  Input,
} from "@course-manager/ui";
import { GraduationCap } from "lucide-react";
import { useTranslation } from "react-i18next";

const testimonials = [
  {
    name: "Dr. Sarah Chen",
    role: "Computer Science",
    initials: "SC",
    quote:
      "EduManager has transformed how I manage my courses. The analytics alone save me hours every week.",
  },
  {
    name: "Prof. James Wilson",
    role: "Mathematics",
    initials: "JW",
    quote:
      "The scheduling system and student tracking are exactly what I needed. Clean, intuitive, and powerful.",
  },
  {
    name: "Emily Rodriguez",
    role: "Student",
    initials: "ER",
    quote:
      "As a student, I love having all my assignments, grades, and schedule in one beautiful interface.",
  },
];

export function TestimonialsSection() {
  const { t } = useTranslation("landing");
  return (
    <section id="testimonials" className="bg-white px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-slate-900">{t("testimonials.title")}</h2>
          <p className="mt-2 text-slate-500">{t("testimonials.subtitle")}</p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{testimonial.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">{testimonial.name}</CardTitle>
                    <CardDescription>{testimonial.role}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">&ldquo;{testimonial.quote}&rdquo;</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CtaSection() {
  const { t } = useTranslation("landing");
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <Card className="bg-blue-600 text-white">
          <CardContent className="flex flex-col items-center p-12 text-center">
            <h2 className="text-3xl font-bold">{t("cta.title")}</h2>
            <p className="mt-4 max-w-lg text-blue-100">{t("cta.description")}</p>
            <div className="mt-8 flex items-center gap-3">
              <Input
                placeholder={t("cta.emailPlaceholder")}
                className="w-64 border-blue-500 bg-blue-700 text-white placeholder:text-blue-300 focus-visible:ring-white"
              />
              <Button variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50">
                {t("cta.getStarted")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

export function LandingFooter() {
  const { t } = useTranslation("landing");
  return (
    <footer className="border-t border-slate-200 bg-white px-6 py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-blue-600" />
          <span className="text-lg font-bold text-slate-900">EduManager</span>
        </div>
        <p className="text-sm text-slate-500">{t("footer.builtWith")}</p>
      </div>
    </footer>
  );
}
