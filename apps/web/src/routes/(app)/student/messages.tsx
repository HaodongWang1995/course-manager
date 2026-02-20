import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@course-manager/ui";
import { MessageSquare, Construction } from "lucide-react";

export const Route = createFileRoute("/(app)/student/messages")({
  component: StudentMessages,
});

function StudentMessages() {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="mt-1 text-sm text-gray-500">
          Communicate with your teachers and classmates
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="relative">
            <MessageSquare className="h-16 w-16 text-gray-200" />
            <Construction className="absolute -bottom-1 -right-1 h-7 w-7 text-amber-400" />
          </div>
          <p className="mt-5 text-base font-semibold text-gray-700">
            消息功能正在开发中
          </p>
          <p className="mt-2 max-w-xs text-sm text-gray-500">
            我们正在打造更好的师生沟通体验，敬请期待。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
