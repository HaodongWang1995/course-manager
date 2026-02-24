import { useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@course-manager/ui";
import { ChevronDown, ChevronUp, Clock, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import type { Schedule } from "@/api/client";
import { formatLocalDateTime, formatLocalTime } from "@/lib/time";
import { useTranslation } from "react-i18next";

interface ScheduleSectionProps {
  schedules: Schedule[];
  onDelete: (id: string) => void;
  onRequestAdd: () => void;
  onRequestEdit: (schedule: Schedule) => void;
}

export function ScheduleSection({
  schedules,
  onDelete,
  onRequestAdd,
  onRequestEdit,
}: ScheduleSectionProps) {
  const { t } = useTranslation("teacherCourseDetail");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t("schedule.title")} ({schedules.length})</CardTitle>
        <Button size="sm" className="gap-1" onClick={onRequestAdd}>
          <Plus className="h-4 w-4" />
          {t("schedule.addButton")}
        </Button>
      </CardHeader>
      <CardContent>
        {schedules.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">{t("schedule.empty")}</p>
        ) : (
          <div className="space-y-3">
            {schedules.map((s) => {
              const isExpanded = expandedId === s.id;
              return (
                <div
                  key={s.id}
                  className="rounded-lg border border-gray-200 transition-colors hover:border-gray-300"
                >
                  <button
                    type="button"
                    className="flex w-full items-center gap-4 p-4 text-left"
                    onClick={() => setExpandedId(isExpanded ? null : s.id)}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">
                      {s.lesson_number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900">
                        {s.title || t("schedule.lesson", { number: s.lesson_number })}
                      </h4>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {formatLocalDateTime(s.start_time)} -{" "}
                          {formatLocalTime(s.end_time)}
                        </span>
                        {s.room && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {s.room}
                          </span>
                        )}
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 shrink-0 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="border-t border-gray-100 px-4 py-3">
                      <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                        <div>
                          <dt className="text-xs font-medium text-gray-400">{t("schedule.startTime")}</dt>
                          <dd className="text-gray-700">{formatLocalDateTime(s.start_time)}</dd>
                        </div>
                        <div>
                          <dt className="text-xs font-medium text-gray-400">{t("schedule.endTime")}</dt>
                          <dd className="text-gray-700">{formatLocalDateTime(s.end_time)}</dd>
                        </div>
                        <div>
                          <dt className="text-xs font-medium text-gray-400">{t("schedule.room")}</dt>
                          <dd className="text-gray-700">{s.room || "-"}</dd>
                        </div>
                        <div>
                          <dt className="text-xs font-medium text-gray-400">{t("schedule.lessonNumber")}</dt>
                          <dd className="text-gray-700">#{s.lesson_number}</dd>
                        </div>
                      </dl>
                      <div className="mt-3 flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1"
                          onClick={() => onRequestEdit(s)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          {t("schedule.edit")}
                        </Button>
                        <Button
                          variant="ghost-destructive"
                          size="sm"
                          className="gap-1"
                          onClick={() => {
                            if (window.confirm(t("addSchedule.confirmDelete"))) {
                              onDelete(s.id);
                            }
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {t("schedule.delete")}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
