import { useTranslation } from "react-i18next";
import {
  Badge,
  Button,
  ScrollArea,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@course-manager/ui";
import { X, MapPin, ExternalLink, BookOpen, MessageSquare, FileText } from "lucide-react";
import type { ScheduleEvent } from "../index";

const courseColors = [
  { bg: "bg-blue-100", border: "border-blue-300", text: "text-blue-800", solid: "bg-blue-500" },
  { bg: "bg-purple-100", border: "border-purple-300", text: "text-purple-800", solid: "bg-purple-500" },
  { bg: "bg-green-100", border: "border-green-300", text: "text-green-800", solid: "bg-green-500" },
  { bg: "bg-orange-100", border: "border-orange-300", text: "text-orange-800", solid: "bg-orange-500" },
  { bg: "bg-pink-100", border: "border-pink-300", text: "text-pink-800", solid: "bg-pink-500" },
  { bg: "bg-teal-100", border: "border-teal-300", text: "text-teal-800", solid: "bg-teal-500" },
];

interface CourseDetailPanelProps {
  event: ScheduleEvent;
  onClose: () => void;
  onNavigate: () => void;
  onFeedback: () => void;
}

function isUrl(str: string) {
  return /^https?:\/\//i.test(str);
}

export function CourseDetailPanel({ event, onClose, onNavigate, onFeedback }: CourseDetailPanelProps) {
  const { t } = useTranslation();
  const c = courseColors[event.colorIdx];
  const roomIsUrl = !!event.room && isUrl(event.room);
  const startTime = new Date(event.start_time).toLocaleString("en-US", {
    weekday: "short", month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  });
  const endTime = new Date(event.end_time).toLocaleTimeString("en-US", {
    hour: "numeric", minute: "2-digit", hour12: true,
  });

  return (
    <div className="w-[300px] shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-white">
      {/* Header */}
      <div className={`relative ${c.bg} p-4`}>
        <button className="absolute right-2 top-2 rounded-lg p-1 hover:bg-black/10" onClick={onClose}>
          <X className="h-4 w-4 text-gray-600" />
        </button>
        <Badge className="mb-2 border-0 bg-white/70 text-xs font-medium text-gray-700">
          {t("schedule.requiredCourse")}
        </Badge>
        <h3 className="pr-6 text-base font-bold text-gray-900">{event.course_title}</h3>
        <p className="mt-1 text-xs text-gray-600">{startTime} – {endTime}</p>
        {event.room && !roomIsUrl && (
          <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="h-3 w-3" />
            {event.room}
          </p>
        )}
      </div>

      {/* Join room button — only shown when room is a URL */}
      {roomIsUrl && (
        <div className="border-b border-gray-100 px-4 py-3">
          <a href={event.room} target="_blank" rel="noopener noreferrer">
            <Button className="w-full gap-2 bg-blue-600 hover:bg-blue-700" size="sm">
              <ExternalLink className="h-4 w-4" />
              {t("schedule.joinRoom")}
            </Button>
          </a>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="instructions">
        <TabsList className="h-auto w-full justify-start gap-0 rounded-none border-b border-gray-100 bg-white p-0 px-4">
          <TabsTrigger value="instructions" className="rounded-none border-b-2 border-transparent px-3 py-2.5 text-xs data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600">
            {t("schedule.instructions")}
          </TabsTrigger>
          <TabsTrigger value="feedback" className="rounded-none border-b-2 border-transparent px-3 py-2.5 text-xs data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600">
            {t("schedule.feedback")}
          </TabsTrigger>
          <TabsTrigger value="resources" className="rounded-none border-b-2 border-transparent px-3 py-2.5 text-xs data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600">
            {t("schedule.resources")}
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[260px]">
          <TabsContent value="instructions" className="m-0 p-4">
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{t("schedule.classAgenda")}</p>
                <p className="mt-1 text-sm text-gray-600">
                  Today's session covers the scheduled curriculum for {event.course_title}.
                  {event.title ? ` Topic: ${event.title}.` : ""}
                </p>
              </div>
              <button onClick={onNavigate} className="flex w-full items-center gap-2 rounded-lg border border-gray-200 p-3 text-left text-sm hover:bg-gray-50">
                <FileText className="h-4 w-4 shrink-0 text-gray-400" />
                <span className="text-gray-700">{t("schedule.viewSyllabus")}</span>
                <ExternalLink className="ml-auto h-3.5 w-3.5 text-gray-400" />
              </button>
            </div>
          </TabsContent>

          <TabsContent value="feedback" className="m-0 p-4">
            <button onClick={onFeedback} className="flex w-full items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-left hover:bg-blue-100">
              <MessageSquare className="h-4 w-4 shrink-0 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">{t("schedule.postFeedback")}</span>
              <ExternalLink className="ml-auto h-3.5 w-3.5 text-blue-500" />
            </button>
          </TabsContent>

          <TabsContent value="resources" className="m-0 p-4">
            <button className="flex w-full items-center gap-2 rounded-lg border border-gray-200 p-3 text-left text-sm hover:bg-gray-50">
              <BookOpen className="h-4 w-4 shrink-0 text-gray-400" />
              <span className="text-gray-700">{t("schedule.viewResources")}</span>
              <ExternalLink className="ml-auto h-3.5 w-3.5 text-gray-400" />
            </button>
          </TabsContent>
        </ScrollArea>
      </Tabs>

      {/* Footer */}
      <div className="border-t border-gray-100 px-4 py-3">
        <button onClick={onNavigate} className="text-xs font-medium text-blue-600 hover:underline">
          {t("schedule.seeSyllabus")}
        </button>
      </div>
    </div>
  );
}
