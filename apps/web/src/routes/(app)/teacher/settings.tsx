import { createFileRoute } from "@tanstack/react-router";
import { TeacherSettingsPage } from "@/pages/teacher/settings";

export const Route = createFileRoute("/(app)/teacher/settings")({
  component: TeacherSettingsPage,
});
