import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  KpiCard,
  CourseCard,
  ScheduleCard,
  Separator,
  Input,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Progress,
} from "@course-manager/ui";
import {
  GraduationCap,
  BookOpen,
  Users,
  BarChart3,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Star,
} from "lucide-react";

export const Route = createFileRoute("/landing")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-slate-900">
              EduManager
            </span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Features
            </a>
            <a
              href="#stats"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Stats
            </a>
            <a
              href="#courses"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Courses
            </a>
            <a
              href="#testimonials"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Testimonials
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link to="/login">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-20 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-4">
              Now in Beta
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 lg:text-6xl">
              Modern Course Management for{" "}
              <span className="text-blue-600">Educators</span>
            </h1>
            <p className="mt-6 text-lg text-slate-500">
              Streamline your teaching workflow with powerful tools for course
              management, student tracking, and performance analytics. Built for
              teachers and students alike.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link to="/login">
                <Button size="lg">
                  Start Teaching
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button variant="outline" size="lg">
                View Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* KPI Stats Section */}
      <section id="stats" className="px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-slate-900">
              Trusted by Educators
            </h2>
            <p className="mt-2 text-slate-500">
              Join thousands of teachers already using EduManager
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              value="2,450"
              label="Active Teachers"
              trend={{ value: "+12%", positive: true }}
            />
            <KpiCard
              value="18,300"
              label="Students Enrolled"
              trend={{ value: "+8%", positive: true }}
            />
            <KpiCard
              value="5,670"
              label="Courses Created"
              trend={{ value: "+15%", positive: true }}
            />
            <KpiCard
              value="98.5%"
              label="Satisfaction Rate"
              trend={{ value: "+2%", positive: true }}
            />
          </div>
        </div>
      </section>

      <Separator className="mx-auto max-w-7xl" />

      {/* Features Section */}
      <section id="features" className="px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <Badge className="mb-4">Features</Badge>
            <h2 className="text-3xl font-bold text-slate-900">
              Everything You Need
            </h2>
            <p className="mt-2 text-slate-500">
              Powerful tools designed for modern education
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Course Management</CardTitle>
                <CardDescription>
                  Create, organize, and manage courses with ease. Track lessons,
                  assignments, and student progress all in one place.
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
                  Manage student profiles, track attendance, and communicate with
                  students and parents efficiently.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Analytics & Reports</CardTitle>
                <CardDescription>
                  Gain insights with detailed performance reports, grade
                  distributions, and engagement metrics.
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
                  Intelligent calendar views for teachers and students with
                  automated conflict detection.
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
                  Create and distribute assignments, collect submissions, and
                  provide feedback seamlessly.
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
                  Collect and manage course feedback from students to
                  continuously improve your teaching methods.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Course Showcase with Tabs */}
      <section id="courses" className="bg-white px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-slate-900">
              Course Showcase
            </h2>
            <p className="mt-2 text-slate-500">
              See how courses and schedules look in EduManager
            </p>
          </div>
          <Tabs defaultValue="courses" className="mx-auto max-w-4xl">
            <TabsList className="mx-auto grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="courses">Courses</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
            </TabsList>
            <TabsContent value="courses">
              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <CourseCard
                  code="CS101"
                  name="Intro to Computer Science"
                  section="Section A - Fall 2025"
                  studentCount={32}
                  lessonCount={24}
                  progress={75}
                />
                <CourseCard
                  code="MATH201"
                  name="Linear Algebra"
                  section="Section B - Fall 2025"
                  studentCount={28}
                  lessonCount={18}
                  progress={60}
                />
                <CourseCard
                  code="ENG102"
                  name="Academic Writing"
                  section="Section C - Fall 2025"
                  studentCount={25}
                  lessonCount={20}
                  progress={100}
                />
              </div>
            </TabsContent>
            <TabsContent value="schedule">
              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <ScheduleCard
                  courseName="Intro to Computer Science"
                  teacher="Dr. Sarah Chen"
                  room="Room 301"
                  startTime="9:00 AM"
                  endTime="10:30 AM"
                  status="in-progress"
                />
                <ScheduleCard
                  courseName="Linear Algebra"
                  teacher="Prof. James Wilson"
                  room="Room 215"
                  startTime="11:00 AM"
                  endTime="12:30 PM"
                  status="upcoming"
                />
                <ScheduleCard
                  courseName="Academic Writing"
                  teacher="Dr. Emily Roberts"
                  room="Room 108"
                  startTime="2:00 PM"
                  endTime="3:30 PM"
                  status="upcoming"
                />
                <ScheduleCard
                  courseName="Physics Lab"
                  teacher="Dr. Michael Park"
                  room="Lab 4B"
                  startTime="8:00 AM"
                  endTime="9:00 AM"
                  status="completed"
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Progress Showcase */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">
                Track Progress at a Glance
              </h2>
              <p className="mt-4 text-slate-500">
                Monitor student performance and course completion with intuitive
                visual indicators.
              </p>
              <div className="mt-8 space-y-6">
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-medium text-slate-700">
                      Overall Completion
                    </span>
                    <span className="text-slate-500">78%</span>
                  </div>
                  <Progress value={78} className="h-3" />
                </div>
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-medium text-slate-700">
                      Assignments Graded
                    </span>
                    <span className="text-slate-500">92%</span>
                  </div>
                  <Progress value={92} className="h-3" />
                </div>
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-medium text-slate-700">
                      Student Engagement
                    </span>
                    <span className="text-slate-500">85%</span>
                  </div>
                  <Progress value={85} className="h-3" />
                </div>
              </div>
            </div>
            <Card className="flex flex-col justify-center">
              <CardHeader>
                <CardTitle>Quick Access</CardTitle>
                <CardDescription>
                  Jump right into your dashboard
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge variant="success">Teacher</Badge>
                  <span className="text-sm text-slate-600">
                    Dashboard, Courses, Students, Reports, Calendar
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="warning">Student</Badge>
                  <span className="text-sm text-slate-600">
                    Schedule, Grades, Assignments, Resources
                  </span>
                </div>
                <Separator />
                <Link to="/login">
                  <Button className="w-full">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="bg-white px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-slate-900">
              Loved by Educators
            </h2>
            <p className="mt-2 text-slate-500">
              Hear what teachers and students say about EduManager
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
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
            ].map((testimonial) => (
              <Card key={testimonial.name}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{testimonial.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">
                        {testimonial.name}
                      </CardTitle>
                      <CardDescription>{testimonial.role}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">
                    "{testimonial.quote}"
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <Card className="bg-blue-600 text-white">
            <CardContent className="flex flex-col items-center p-12 text-center">
              <h2 className="text-3xl font-bold">
                Ready to Transform Your Teaching?
              </h2>
              <p className="mt-4 max-w-lg text-blue-100">
                Join thousands of educators who are already using EduManager to
                streamline their workflow and improve student outcomes.
              </p>
              <div className="mt-8 flex items-center gap-3">
                <Input
                  placeholder="Enter your email"
                  className="w-64 border-blue-500 bg-blue-700 text-white placeholder:text-blue-300 focus-visible:ring-white"
                />
                <Button
                  variant="secondary"
                  className="bg-white text-blue-600 hover:bg-blue-50"
                >
                  Get Started
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-6 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-blue-600" />
            <span className="text-lg font-bold text-slate-900">
              EduManager
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Built with the @course-manager/ui component library.
          </p>
        </div>
      </footer>
    </div>
  );
}
