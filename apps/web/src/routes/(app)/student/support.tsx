import { createFileRoute } from "@tanstack/react-router";
import { StudentSupportPage } from "@/pages/student/support";

export const Route = createFileRoute("/(app)/student/support")({
  component: StudentSupportPage,
});
