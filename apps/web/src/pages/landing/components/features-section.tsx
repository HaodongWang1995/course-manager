import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
  KpiCard,
  Separator,
} from "@course-manager/ui";
import {
  BookOpen,
  Users,
  BarChart3,
  Calendar,
  CheckCircle2,
  Star,
} from "lucide-react";
import { useTranslation } from "react-i18next";

export function StatsSection() {
  const { t } = useTranslation("landing");
  return (
    <section id="stats" className="px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-slate-900">{t("stats.title")}</h2>
          <p className="mt-2 text-slate-500">{t("stats.subtitle")}</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard value="2,450" label={t("stats.activeTeachers")} trend={{ value: "+12%", positive: true }} />
          <KpiCard value="18,300" label={t("stats.studentsEnrolled")} trend={{ value: "+8%", positive: true }} />
          <KpiCard value="5,670" label={t("stats.coursesCreated")} trend={{ value: "+15%", positive: true }} />
          <KpiCard value="98.5%" label={t("stats.satisfactionRate")} trend={{ value: "+2%", positive: true }} />
        </div>
      </div>
    </section>
  );
}

export function FeaturesSection() {
  const { t } = useTranslation("landing");
  return (
    <>
      <Separator className="mx-auto max-w-7xl" />
      <section id="features" className="px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <Badge className="mb-4">{t("features.badge")}</Badge>
            <h2 className="text-3xl font-bold text-slate-900">{t("features.title")}</h2>
            <p className="mt-2 text-slate-500">{t("features.subtitle")}</p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-lg">{t("features.courseManagement.title")}</CardTitle>
                <CardDescription>{t("features.courseManagement.description")}</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-lg">{t("features.studentDirectory.title")}</CardTitle>
                <CardDescription>{t("features.studentDirectory.description")}</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-lg">{t("features.analytics.title")}</CardTitle>
                <CardDescription>{t("features.analytics.description")}</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-lg">{t("features.scheduling.title")}</CardTitle>
                <CardDescription>{t("features.scheduling.description")}</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-lg">{t("features.assignments.title")}</CardTitle>
                <CardDescription>{t("features.assignments.description")}</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                  <Star className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-lg">{t("features.feedback.title")}</CardTitle>
                <CardDescription>{t("features.feedback.description")}</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}
