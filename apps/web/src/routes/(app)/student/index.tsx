import { createFileRoute } from "@tanstack/react-router";
import { StudentSchedulePage } from "@/pages/student/schedule";

export const Route = createFileRoute("/(app)/student/")({
  component: StudentSchedulePage,
});
