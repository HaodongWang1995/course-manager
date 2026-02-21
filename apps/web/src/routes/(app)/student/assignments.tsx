import { createFileRoute } from "@tanstack/react-router";
import { StudentAssignmentsPage } from "@/pages/student/assignments";

export const Route = createFileRoute("/(app)/student/assignments")({
  component: StudentAssignmentsPage,
});
