import { Link } from "@tanstack/react-router";
import { Button, Badge } from "@course-manager/ui";
import { GraduationCap, ArrowRight } from "lucide-react";

export function LandingNav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold text-slate-900">EduManager</span>
        </div>
        <div className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            Features
          </a>
          <a href="#stats" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            Stats
          </a>
          <a href="#courses" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            Courses
          </a>
          <a href="#testimonials" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            Testimonials
          </a>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm">Log in</Button>
          </Link>
          <Link to="/courses">
            <Button size="sm">Browse Courses</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-6 py-20 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="secondary" className="mb-4">Now in Beta</Badge>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 lg:text-6xl">
            Modern Course Management for{" "}
            <span className="text-blue-600">Educators</span>
          </h1>
          <p className="mt-6 text-lg text-slate-500">
            Streamline your teaching workflow with powerful tools for course management,
            student tracking, and performance analytics. Built for teachers and students alike.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link to="/login">
              <Button size="lg">
                Start Teaching
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/courses">
              <Button variant="outline" size="lg">Browse Courses</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
