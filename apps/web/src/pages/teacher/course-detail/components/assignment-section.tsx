import { Button, Card, CardContent, CardHeader, CardTitle } from "@course-manager/ui";
import { BookOpen, Calendar, Plus, Trash2 } from "lucide-react";
import type { Assignment } from "@/api/client";
import { useTranslation } from "react-i18next";

interface AssignmentSectionProps {
  assignments: Assignment[];
  onDelete: (id: string) => void;
  onRequestAdd: () => void;
}

export function AssignmentSection({
  assignments,
  onDelete,
  onRequestAdd,
}: AssignmentSectionProps) {
  const { t } = useTranslation("teacherCourseDetail");
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-gray-500" />
          <CardTitle>{t("assignment.title")} ({assignments.length})</CardTitle>
        </div>
        <Button size="sm" variant="outline" onClick={onRequestAdd}>
          <Plus className="h-4 w-4 mr-1" /> {t("assignment.addButton")}
        </Button>
      </CardHeader>
      <CardContent>
        {assignments.length === 0 ? (
          <p className="py-4 text-center text-sm text-gray-400">{t("assignment.empty")}</p>
        ) : (
          <div className="space-y-2">
            {assignments.map((a) => (
              <div
                key={a.id}
                className="flex items-start justify-between gap-3 rounded-lg border border-gray-200 p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">{a.title}</p>
                  {a.description && (
                    <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">{a.description}</p>
                  )}
                  <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                    <Calendar className="h-3 w-3" />
                    {t("assignment.due", { date: new Date(a.due_date).toLocaleDateString() })}
                  </p>
                </div>
                <Button
                  variant="ghost-destructive"
                  size="icon"
                  onClick={() => {
                    if (window.confirm(t("assignment.confirmDelete"))) {
                      onDelete(a.id);
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
