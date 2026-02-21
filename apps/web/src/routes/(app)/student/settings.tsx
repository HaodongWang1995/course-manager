import { createFileRoute } from "@tanstack/react-router";
import { StudentSettingsPage } from "@/pages/student/settings";

export const Route = createFileRoute("/(app)/student/settings")({
  component: StudentSettingsPage,
});
