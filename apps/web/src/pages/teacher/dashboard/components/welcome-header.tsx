import { GraduationCap } from "lucide-react";
import { useTranslation } from "react-i18next";

function getGreeting(): "welcome.morning" | "welcome.afternoon" | "welcome.evening" {
  const hour = new Date().getHours();
  if (hour < 12) return "welcome.morning";
  if (hour < 18) return "welcome.afternoon";
  return "welcome.evening";
}

interface WelcomeHeaderProps {
  userName: string;
  classCount: number;
  urgentDeadlineCount: number;
}

export function WelcomeHeader({ userName, classCount, urgentDeadlineCount }: WelcomeHeaderProps) {
  const { t } = useTranslation("dashboard");
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">
      <div className="relative z-10">
        <h2 className="text-xl font-bold text-white">
          {t(getGreeting())}, {userName}!
        </h2>
        <p className="mt-1 text-sm text-blue-100">
          {t("welcome.subtitle", { classCount, urgentCount: urgentDeadlineCount })}
        </p>
      </div>
      <GraduationCap className="absolute right-4 top-1/2 h-20 w-20 -translate-y-1/2 text-white/15" />
    </div>
  );
}
