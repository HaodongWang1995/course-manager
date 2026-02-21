import { Button, Card, CardContent, CardHeader, CardTitle } from "@course-manager/ui";
import { Clock, MapPin, Plus, Trash2 } from "lucide-react";
import type { Schedule } from "@/api/client";
import { formatLocalDateTime, formatLocalTime } from "@/lib/time";

interface ScheduleSectionProps {
  schedules: Schedule[];
  onDelete: (id: string) => void;
  onRequestAdd: () => void;
}

export function ScheduleSection({
  schedules,
  onDelete,
  onRequestAdd,
}: ScheduleSectionProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>课程日程 ({schedules.length})</CardTitle>
        <Button size="sm" className="gap-1" onClick={onRequestAdd}>
          <Plus className="h-4 w-4" />
          添加课时
        </Button>
      </CardHeader>
      <CardContent>
        {schedules.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">暂无课时，点击上方按钮添加</p>
        ) : (
          <div className="space-y-3">
            {schedules.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-4 rounded-lg border border-gray-200 p-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">
                  {s.lesson_number}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">
                    {s.title || `第 ${s.lesson_number} 课`}
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
                <Button
                  variant="ghost-destructive"
                  size="icon"
                  onClick={() => {
                    if (window.confirm("确定要删除此课时吗？")) {
                      onDelete(s.id);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
