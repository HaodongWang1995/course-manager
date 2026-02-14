import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/(app)/teacher/courses")({
  component: CoursesLayout,
});

function CoursesLayout() {
  return <Outlet />;
}
