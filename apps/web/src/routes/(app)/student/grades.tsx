import { createFileRoute } from "@tanstack/react-router";
import { StudentGradesPage } from "@/pages/student/grades";

export const Route = createFileRoute("/(app)/student/grades")({
  component: StudentGradesPage,
});
