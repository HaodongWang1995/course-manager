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

export const Route = createFileRoute("/(app)/teacher/settings")({
  component: TeacherSettings,
});

function TeacherSettings() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account preferences
        </p>
      </div>

      {/* Profile Section */}
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
            <Input placeholder="Your name" defaultValue="Professor Smith" />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" placeholder="Email" defaultValue="smith@edu.com" disabled />
          </div>
          <div className="space-y-2">
            <Label>Bio</Label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tell students about yourself..."
            />
          </div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-4 w-4" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: "Email notifications for new enrollments", defaultChecked: true },
            { label: "Push notifications for messages", defaultChecked: true },
            { label: "Weekly report summary", defaultChecked: false },
          ].map((item) => (
            <label key={item.label} className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{item.label}</span>
              <input type="checkbox" defaultChecked={item.defaultChecked} className="h-4 w-4 rounded border-gray-300 text-blue-600" />
            </label>
          ))}
        </CardContent>
      </Card>

      {/* Security */}
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
            <Input type="password" placeholder="Enter current password" />
          </div>
          <div className="space-y-2">
            <Label>New Password</Label>
            <Input type="password" placeholder="Enter new password" />
          </div>
          <Button variant="outline">Update Password</Button>
        </CardContent>
      </Card>

      {/* Appearance */}
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
