import { createFileRoute } from "@tanstack/react-router";
import { StudentEnrollmentsPage } from "@/pages/student/enrollments";

export const Route = createFileRoute("/(app)/student/enrollments")({
  component: StudentEnrollmentsPage,
});
