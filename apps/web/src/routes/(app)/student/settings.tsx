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

export const Route = createFileRoute("/(app)/student/settings")({
  component: StudentSettings,
});

function StudentSettings() {
  const { data: user } = useCurrentUser();

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

  const handleSaveProfile = () => {
    setProfileMsg("");
    profileMutation.mutate(
      { name },
      {
        onSuccess: () => setProfileMsg("保存成功"),
        onError: (e) => setProfileMsg(e.message || "保存失败"),
      },
    );
  };

  const handleUpdatePassword = () => {
    setPwMsg("");
    passwordMutation.mutate(
      { current_password: currentPw, new_password: newPw },
      {
        onSuccess: () => {
          setPwMsg("密码已更新");
          setCurrentPw("");
          setNewPw("");
        },
        onError: (e) => setPwMsg(e.message || "更新失败"),
      },
    );
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Display Name</Label>
            <Input
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" value={user?.email ?? ""} disabled />
          </div>
          {profileMsg && (
            <p className={`text-sm ${profileMsg === "保存成功" ? "text-emerald-600" : "text-red-600"}`}>
              {profileMsg}
            </p>
          )}
          <Button
            onClick={handleSaveProfile}
            disabled={profileMutation.isPending || !name.trim()}
          >
            {profileMutation.isPending ? "保存中..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-4 w-4" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: "Email notifications for enrollment updates", defaultChecked: true },
            { label: "Push notifications for new messages", defaultChecked: true },
            { label: "Grade update alerts", defaultChecked: true },
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4" />
            Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Current Password</Label>
            <Input
              type="password"
              placeholder="Enter current password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>New Password</Label>
            <Input
              type="password"
              placeholder="Enter new password (min. 6 chars)"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
            />
          </div>
          {pwMsg && (
            <p className={`text-sm ${pwMsg === "密码已更新" ? "text-emerald-600" : "text-red-600"}`}>
              {pwMsg}
            </p>
          )}
          <Button
            variant="outline"
            onClick={handleUpdatePassword}
            disabled={passwordMutation.isPending || !currentPw || !newPw}
          >
            {passwordMutation.isPending ? "更新中..." : "Update Password"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Palette className="h-4 w-4" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Language</p>
              <p className="text-xs text-gray-500">Choose your preferred language</p>
            </div>
            <select className="rounded-md border border-gray-200 px-3 py-1.5 text-sm">
              <option>English</option>
              <option>中文</option>
            </select>
          </div>
          <Separator className="my-4" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Theme</p>
              <p className="text-xs text-gray-500">Select your preferred theme</p>
            </div>
            <select className="rounded-md border border-gray-200 px-3 py-1.5 text-sm">
              <option>Light</option>
              <option>Dark</option>
              <option>System</option>
            </select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
