import { createFileRoute } from "@tanstack/react-router";
import { StudentDetailPage } from "@/pages/teacher/student-detail";

export const Route = createFileRoute("/(app)/teacher/students/$studentId")({
  component: StudentDetailPage,
});
