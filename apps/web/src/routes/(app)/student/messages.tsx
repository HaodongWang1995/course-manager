import { createFileRoute } from "@tanstack/react-router";
import {
  Card,
  CardContent,
  Badge,
  Button,
  Input,
} from "@course-manager/ui";
import { MessageSquare, Search, Send } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { useState } from "react";

export const Route = createFileRoute("/(app)/student/messages")({
  component: StudentMessages,
});

const mockConversations = [
  {
    id: "1",
    name: "Prof. Zhang Wei",
    avatar: "ZW",
    lastMessage: "Please submit your assignment by Friday.",
    time: "2h ago",
    unread: 2,
    course: "Linear Algebra",
  },
  {
    id: "2",
    name: "Teaching Assistant",
    avatar: "TA",
    lastMessage: "The study materials have been uploaded.",
    time: "Yesterday",
    unread: 0,
    course: "Calculus II",
  },
  {
    id: "3",
    name: "System Notification",
    avatar: "SN",
    lastMessage: "Your enrollment for Computer Science 101 has been approved.",
    time: "3 days ago",
    unread: 0,
    course: "",
  },
];

function StudentMessages() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = mockConversations.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selected = mockConversations.find((c) => c.id === selectedId);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="mt-1 text-sm text-gray-500">
          Communicate with teachers and classmates
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        {/* Conversation List */}
        <Card className="h-[calc(100vh-220px)] overflow-hidden">
          <div className="border-b p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-500">No conversations found</div>
            ) : (
              filtered.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedId(conv.id)}
                  className={`flex w-full items-start gap-3 border-b border-gray-100 p-3 text-left transition-colors hover:bg-gray-50 ${
                    selectedId === conv.id ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                    {conv.avatar}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-900 truncate">{conv.name}</span>
                      <span className="text-xs text-gray-400 shrink-0 ml-1">{conv.time}</span>
                    </div>
                    {conv.course && (
                      <span className="text-[10px] text-gray-400">{conv.course}</span>
                    )}
                    <p className="mt-0.5 text-xs text-gray-500 truncate">{conv.lastMessage}</p>
                  </div>
                  {conv.unread > 0 && (
                    <Badge className="shrink-0 bg-blue-600 text-white">{conv.unread}</Badge>
                  )}
                </button>
              ))
            )}
          </div>
        </Card>

        {/* Message Detail */}
        <Card className="hidden h-[calc(100vh-220px)] lg:flex lg:flex-col">
          {selected ? (
            <>
              <div className="flex items-center gap-3 border-b p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                  {selected.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{selected.name}</p>
                  {selected.course && (
                    <p className="text-xs text-gray-500">{selected.course}</p>
                  )}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="flex justify-start">
                  <div className="max-w-[70%] rounded-2xl rounded-tl-sm bg-gray-100 px-4 py-2.5 text-sm text-gray-800">
                    {selected.lastMessage}
                  </div>
                </div>
              </div>
              <div className="border-t p-3">
                <div className="flex gap-2">
                  <Input placeholder="Type a message..." className="flex-1" />
                  <Button size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <EmptyState
                icon={MessageSquare}
                title="Select a conversation"
                description="Choose a conversation from the list to start messaging"
              />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
