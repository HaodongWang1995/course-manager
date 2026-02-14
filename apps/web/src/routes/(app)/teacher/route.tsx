import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/(app)/teacher")({
  component: TeacherOutlet,
});

function TeacherOutlet() {
  return <Outlet />;
}
