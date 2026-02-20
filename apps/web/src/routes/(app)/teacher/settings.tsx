import { createFileRoute } from "@tanstack/react-router";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Separator,
} from "@course-manager/ui";
import { User, Bell, Shield, Palette } from "lucide-react";
import { useState, useEffect } from "react";
import { useCurrentUser, useUpdateProfile, useUpdatePassword } from "@/hooks/use-queries";
import { useTranslation } from "react-i18next";
import { setLanguage } from "@/lib/i18n";

export const Route = createFileRoute("/(app)/teacher/settings")({
  component: TeacherSettings,
});

function TeacherSettings() {
  const { data: user } = useCurrentUser();
  const { t, i18n } = useTranslation();

  const [name, setName] = useState("");
  const [profileMsg, setProfileMsg] = useState("");

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [pwMsg, setPwMsg] = useState("");

  const profileMutation = useUpdateProfile();
  const passwordMutation = useUpdatePassword();

  useEffect(() => {
    if (user) setName(user.name);
  }, [user]);

  const handleSaveProfile = async () => {
    setProfileMsg("");
    profileMutation.mutate(
      { name },
      {
        onSuccess: () => setProfileMsg(t("settings.profile.saveSuccess")),
        onError: (e) => setProfileMsg(e.message || t("settings.profile.saveFailed")),
      },
    );
  };

  const handleUpdatePassword = async () => {
    setPwMsg("");
    passwordMutation.mutate(
      { current_password: currentPw, new_password: newPw },
      {
        onSuccess: () => {
          setPwMsg(t("settings.security.updateSuccess"));
          setCurrentPw("");
          setNewPw("");
        },
        onError: (e) => setPwMsg(e.message || t("settings.security.updateSuccess")),
      },
    );
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t("settings.title")}</h1>
        <p className="mt-1 text-sm text-gray-500">{t("settings.subtitle")}</p>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4" />
            {t("settings.profile.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t("settings.profile.displayName")}</Label>
            <Input
              placeholder={t("settings.profile.displayName")}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("settings.profile.email")}</Label>
            <Input
              type="email"
              value={user?.email ?? ""}
              disabled
            />
          </div>
          {profileMsg && (
            <p className={`text-sm ${profileMsg === t("settings.profile.saveSuccess") ? "text-emerald-600" : "text-red-600"}`}>
              {profileMsg}
            </p>
          )}
          <Button onClick={handleSaveProfile} disabled={profileMutation.isPending || !name.trim()}>
            {profileMutation.isPending ? t("settings.profile.saving") : t("settings.profile.save")}
          </Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-4 w-4" />
            {t("settings.notifications.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: t("settings.notifications.teacher.enrollments"), defaultChecked: true },
            { label: t("settings.notifications.teacher.messages"), defaultChecked: true },
            { label: t("settings.notifications.teacher.weekly"), defaultChecked: false },
          ].map((item) => (
            <label key={item.label} className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{item.label}</span>
              <input
                type="checkbox"
                defaultChecked={item.defaultChecked}
                className="h-4 w-4 rounded border-gray-300 text-blue-600"
              />
            </label>
          ))}
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4" />
            {t("settings.security.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t("settings.security.currentPassword")}</Label>
            <Input
              type="password"
              placeholder={t("settings.security.currentPasswordPlaceholder")}
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("settings.security.newPassword")}</Label>
            <Input
              type="password"
              placeholder={t("settings.security.newPasswordPlaceholder")}
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
            />
          </div>
          {pwMsg && (
            <p className={`text-sm ${pwMsg === t("settings.security.updateSuccess") ? "text-emerald-600" : "text-red-600"}`}>
              {pwMsg}
            </p>
          )}
          <Button
            variant="outline"
            onClick={handleUpdatePassword}
            disabled={passwordMutation.isPending || !currentPw || !newPw}
          >
            {passwordMutation.isPending ? t("settings.security.updating") : t("settings.security.update")}
          </Button>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Palette className="h-4 w-4" />
            {t("settings.appearance.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">{t("settings.appearance.language")}</p>
              <p className="text-xs text-gray-500">{t("settings.appearance.languageDesc")}</p>
            </div>
            <select
              className="rounded-md border border-gray-200 px-3 py-1.5 text-sm"
              value={i18n.language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="en">English</option>
              <option value="zh">中文</option>
            </select>
          </div>
          <Separator className="my-4" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">{t("settings.appearance.theme")}</p>
              <p className="text-xs text-gray-500">{t("settings.appearance.themeDesc")}</p>
            </div>
            <select className="rounded-md border border-gray-200 px-3 py-1.5 text-sm">
              <option value="light">{t("settings.appearance.light")}</option>
              <option value="dark">{t("settings.appearance.dark")}</option>
              <option value="system">{t("settings.appearance.system")}</option>
            </select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
