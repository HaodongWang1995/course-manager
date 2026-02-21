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
import { ArrowRight, GraduationCap } from "lucide-react";

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
  return (
    <section id="testimonials" className="bg-white px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-slate-900">Loved by Educators</h2>
          <p className="mt-2 text-slate-500">
            Hear what teachers and students say about EduManager
          </p>
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
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <Card className="bg-blue-600 text-white">
          <CardContent className="flex flex-col items-center p-12 text-center">
            <h2 className="text-3xl font-bold">Ready to Transform Your Teaching?</h2>
            <p className="mt-4 max-w-lg text-blue-100">
              Join thousands of educators who are already using EduManager to streamline their
              workflow and improve student outcomes.
            </p>
            <div className="mt-8 flex items-center gap-3">
              <Input
                placeholder="Enter your email"
                className="w-64 border-blue-500 bg-blue-700 text-white placeholder:text-blue-300 focus-visible:ring-white"
              />
              <Button variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50">
                Get Started
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

export function LandingFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white px-6 py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-blue-600" />
          <span className="text-lg font-bold text-slate-900">EduManager</span>
        </div>
        <p className="text-sm text-slate-500">
          Built with the @course-manager/ui component library.
        </p>
      </div>
    </footer>
  );
}
