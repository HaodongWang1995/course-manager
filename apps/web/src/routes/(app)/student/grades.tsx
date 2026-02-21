import { createFileRoute } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";
import { useTranslation } from "react-i18next";

function GradesComingSoon() {
  const { t } = useTranslation("common");
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 mb-4">
        <GraduationCap className="h-8 w-8 text-blue-400" />
      </div>
      <h2 className="text-xl font-bold text-gray-900">Grades</h2>
      <p className="mt-2 text-sm text-gray-500">{t("comingSoon")}</p>
    </div>
  );
}

export const Route = createFileRoute("/(app)/student/grades")({
  component: GradesComingSoon,
});
