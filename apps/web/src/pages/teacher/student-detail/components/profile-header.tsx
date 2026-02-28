import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import { Avatar, AvatarFallback, Badge, Button } from "@course-manager/ui";
import { ArrowLeft, Mail, FileDown } from "lucide-react";
import type { TeacherStudentDetail } from "@/api/client";

interface ProfileHeaderProps {
  student: TeacherStudentDetail;
}

export function ProfileHeader({ student }: ProfileHeaderProps) {
  const { t } = useTranslation("studentDetail");
  const initials = student.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const joinDate = new Date(student.created_at).toLocaleDateString();

  return (
    <>
      {/* H5 Header */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Link to="/teacher/students" className="text-slate-600 hover:text-slate-900">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-lg font-semibold">{t("title")}</h1>
          </div>
          <Button size="sm" className="gap-1.5" onClick={() => alert(t("comingSoon"))}>
            <Mail className="h-4 w-4" />
            {t("message")}
          </Button>
        </div>
        <div className="flex flex-col items-center pb-6 pt-2">
          <Avatar className="h-24 w-24">
            <AvatarFallback className="bg-blue-600 text-xl font-medium text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <h2 className="mt-4 text-2xl font-bold text-slate-900">{student.name}</h2>
          <p className="text-sm text-slate-500">
            ID: #{student.id.slice(0, 6)} | {t("joined")} {joinDate}
          </p>
        </div>
      </div>

      {/* PC Header */}
      <div className="hidden lg:block">
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-5">
          <div className="flex items-center gap-5">
            <Link to="/teacher/students" className="text-slate-400 hover:text-slate-600">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-blue-600 text-sm font-medium text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">{student.name}</h2>
                <Badge variant="default" className="bg-emerald-100 text-emerald-700">
                  {t("active")}
                </Badge>
              </div>
              <p className="text-sm text-slate-500">
                ID: #{student.id.slice(0, 6)} &bull; {t("joined")} {joinDate}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-1.5" onClick={() => alert(t("comingSoon"))}>
              <FileDown className="h-4 w-4" />
              {t("exportReport")}
            </Button>
            <Button className="gap-1.5" onClick={() => alert(t("comingSoon"))}>
              <Mail className="h-4 w-4" />
              {t("message")}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
