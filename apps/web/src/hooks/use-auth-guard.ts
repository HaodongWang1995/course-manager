import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useCurrentUser, useLogout } from "./use-queries";
import { getToken } from "@/api/client";

export function useAuthGuard(role?: "teacher" | "student") {
  const navigate = useNavigate();
  const { data: user, isLoading, isError } = useCurrentUser();

  useEffect(() => {
    if (!getToken()) {
      navigate({ to: "/login" });
      return;
    }
    if (!isLoading && (isError || (role && user && user.role !== role))) {
      navigate({ to: "/login" });
    }
  }, [user, isLoading, isError, navigate, role]);

  const isAuthed = !isLoading && !!user && (!role || user.role === role);

  return { user, isLoading, isAuthed };
}

export function useAuthLogout() {
  const navigate = useNavigate();
  const logoutMutation = useLogout();

  const logout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => navigate({ to: "/login" }),
    });
  };

  return logout;
}
