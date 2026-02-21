import { Link } from "@tanstack/react-router";
import { Button, Badge } from "@course-manager/ui";
import { GraduationCap, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export function LandingNav() {
  const { t } = useTranslation("landing");
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold text-slate-900">EduManager</span>
        </div>
        <div className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            {t("nav.features")}
          </a>
          <a href="#stats" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            {t("nav.stats")}
          </a>
          <a href="#courses" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            {t("nav.courses")}
          </a>
          <a href="#testimonials" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            {t("nav.testimonials")}
          </a>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm">{t("nav.login")}</Button>
          </Link>
          <Link to="/courses">
            <Button size="sm">{t("nav.browseCourses")}</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

export function HeroSection() {
  const { t } = useTranslation("landing");
  return (
    <section className="relative overflow-hidden px-6 py-20 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="secondary" className="mb-4">{t("hero.badge")}</Badge>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 lg:text-6xl">
            {t("hero.title")}{" "}
            <span className="text-blue-600">{t("hero.titleHighlight")}</span>
          </h1>
          <p className="mt-6 text-lg text-slate-500">
            {t("hero.description")}
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link to="/login">
              <Button size="lg">
                {t("hero.startTeaching")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/courses">
              <Button variant="outline" size="lg">{t("hero.browseCourses")}</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
