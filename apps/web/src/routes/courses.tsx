import { createFileRoute } from "@tanstack/react-router";
import { PublicCourseBrowsePage } from "@/pages/public/courses";

export const Route = createFileRoute("/courses")({
  component: PublicCourseBrowsePage,
});
