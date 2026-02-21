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

export function StatsSection() {
  return (
    <section id="stats" className="px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-slate-900">Trusted by Educators</h2>
          <p className="mt-2 text-slate-500">Join thousands of teachers already using EduManager</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard value="2,450" label="Active Teachers" trend={{ value: "+12%", positive: true }} />
          <KpiCard value="18,300" label="Students Enrolled" trend={{ value: "+8%", positive: true }} />
          <KpiCard value="5,670" label="Courses Created" trend={{ value: "+15%", positive: true }} />
          <KpiCard value="98.5%" label="Satisfaction Rate" trend={{ value: "+2%", positive: true }} />
        </div>
      </div>
    </section>
  );
}

export function FeaturesSection() {
  return (
    <>
      <Separator className="mx-auto max-w-7xl" />
      <section id="features" className="px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <Badge className="mb-4">Features</Badge>
            <h2 className="text-3xl font-bold text-slate-900">Everything You Need</h2>
            <p className="mt-2 text-slate-500">Powerful tools designed for modern education</p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Course Management</CardTitle>
                <CardDescription>
                  Create, organize, and manage courses with ease. Track lessons, assignments, and
                  student progress all in one place.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Student Directory</CardTitle>
                <CardDescription>
                  Manage student profiles, track attendance, and communicate with students and
                  parents efficiently.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Analytics &amp; Reports</CardTitle>
                <CardDescription>
                  Gain insights with detailed performance reports, grade distributions, and
                  engagement metrics.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Smart Scheduling</CardTitle>
                <CardDescription>
                  Intelligent calendar views for teachers and students with automated conflict
                  detection.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Assignment Center</CardTitle>
                <CardDescription>
                  Create and distribute assignments, collect submissions, and provide feedback
                  seamlessly.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                  <Star className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Feedback System</CardTitle>
                <CardDescription>
                  Collect and manage course feedback from students to continuously improve your
                  teaching methods.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}
