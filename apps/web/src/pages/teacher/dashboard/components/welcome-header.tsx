import { GraduationCap } from "lucide-react";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

interface WelcomeHeaderProps {
  userName: string;
  classCount: number;
  urgentDeadlineCount: number;
}

export function WelcomeHeader({ userName, classCount, urgentDeadlineCount }: WelcomeHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">
      <div className="relative z-10">
        <h2 className="text-xl font-bold text-white">
          {getGreeting()}, {userName}!
        </h2>
        <p className="mt-1 text-sm text-blue-100">
          You have {classCount} classes today and {urgentDeadlineCount} urgent deadlines.
        </p>
      </div>
      <GraduationCap className="absolute right-4 top-1/2 h-20 w-20 -translate-y-1/2 text-white/15" />
    </div>
  );
}
