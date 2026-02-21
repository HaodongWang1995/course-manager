import { createFileRoute } from "@tanstack/react-router";
import { StudentsPage } from "@/pages/teacher/students";

export const Route = createFileRoute("/(app)/teacher/students")({
  component: StudentsPage,
});
