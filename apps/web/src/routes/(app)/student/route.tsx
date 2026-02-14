import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/(app)/student")({
  component: StudentOutlet,
});

function StudentOutlet() {
  return <Outlet />;
}
