import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/(app)/teacher/students")({
  component: () => <Outlet />,
});
