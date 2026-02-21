import { createFileRoute } from "@tanstack/react-router";
import { TeacherCoursesPage } from "@/pages/teacher/courses";

export const Route = createFileRoute("/(app)/teacher/courses/")({
  component: TeacherCoursesPage,
});
