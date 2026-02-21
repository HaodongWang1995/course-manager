import { Link } from "@tanstack/react-router";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  ScheduleCard,
  Separator,
  Progress,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@course-manager/ui";
import { ArrowRight } from "lucide-react";
import { Button } from "@course-manager/ui";
import { useTranslation } from "react-i18next";

function CourseCard({
  code,
  name,
  section,
  studentCount,
  lessonCount,
  progress,
}: {
  code: string;
  name: string;
  section: string;
  studentCount: number;
  lessonCount: number;
  progress: number;
}) {
  const { t } = useTranslation("landing");
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <span className="inline-block rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
        {code}
      </span>
      <h3 className="mt-3 text-base font-semibold text-gray-900">{name}</h3>
      <p className="mt-1 text-sm text-gray-500">{section}</p>
      <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
        <span>{studentCount} {t("showcase.students")}</span>
        <span>{lessonCount} {t("showcase.lessons")}</span>
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">{t("showcase.progress")}</span>
          <span className="font-medium text-gray-900">{progress}%</span>
        </div>
        <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className={`h-full rounded-full ${progress === 100 ? "bg-green-500" : "bg-blue-600"}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export function CourseShowcaseSection() {
  const { t } = useTranslation("landing");
  return (
    <section id="courses" className="bg-white px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-slate-900">{t("showcase.title")}</h2>
          <p className="mt-2 text-slate-500">{t("showcase.subtitle")}</p>
        </div>
        <Tabs defaultValue="courses" className="mx-auto max-w-4xl">
          <TabsList className="mx-auto grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="courses">{t("showcase.tabCourses")}</TabsTrigger>
            <TabsTrigger value="schedule">{t("showcase.tabSchedule")}</TabsTrigger>
          </TabsList>
          <TabsContent value="courses">
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <CourseCard code="CS101" name="Intro to Computer Science" section="Section A - Fall 2025" studentCount={32} lessonCount={24} progress={75} />
              <CourseCard code="MATH201" name="Linear Algebra" section="Section B - Fall 2025" studentCount={28} lessonCount={18} progress={60} />
              <CourseCard code="ENG102" name="Academic Writing" section="Section C - Fall 2025" studentCount={25} lessonCount={20} progress={100} />
            </div>
          </TabsContent>
          <TabsContent value="schedule">
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <ScheduleCard courseName="Intro to Computer Science" teacher="Dr. Sarah Chen" room="Room 301" startTime="9:00 AM" endTime="10:30 AM" status="in-progress" />
              <ScheduleCard courseName="Linear Algebra" teacher="Prof. James Wilson" room="Room 215" startTime="11:00 AM" endTime="12:30 PM" status="upcoming" />
              <ScheduleCard courseName="Academic Writing" teacher="Dr. Emily Roberts" room="Room 108" startTime="2:00 PM" endTime="3:30 PM" status="upcoming" />
              <ScheduleCard courseName="Physics Lab" teacher="Dr. Michael Park" room="Lab 4B" startTime="8:00 AM" endTime="9:00 AM" status="completed" />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}

export function ProgressSection() {
  const { t } = useTranslation("landing");
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">{t("progressSection.title")}</h2>
            <p className="mt-4 text-slate-500">{t("progressSection.description")}</p>
            <div className="mt-8 space-y-6">
              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-medium text-slate-700">{t("progressSection.overallCompletion")}</span>
                  <span className="text-slate-500">78%</span>
                </div>
                <Progress value={78} className="h-3" />
              </div>
              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-medium text-slate-700">{t("progressSection.assignmentsGraded")}</span>
                  <span className="text-slate-500">92%</span>
                </div>
                <Progress value={92} className="h-3" />
              </div>
              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-medium text-slate-700">{t("progressSection.studentEngagement")}</span>
                  <span className="text-slate-500">85%</span>
                </div>
                <Progress value={85} className="h-3" />
              </div>
            </div>
          </div>
          <Card className="flex flex-col justify-center">
            <CardHeader>
              <CardTitle>{t("progressSection.quickAccess")}</CardTitle>
              <CardDescription>{t("progressSection.quickAccessDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge variant="success">Teacher</Badge>
                <span className="text-sm text-slate-600">{t("progressSection.teacherFeatures")}</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="warning">Student</Badge>
                <span className="text-sm text-slate-600">{t("progressSection.studentFeatures")}</span>
              </div>
              <Separator />
              <Link to="/login">
                <Button className="w-full">
                  {t("progressSection.goToDashboard")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
