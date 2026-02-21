import { Button, Card, CardContent, CardHeader, CardTitle } from "@course-manager/ui";
import { FileText, Plus, Trash2 } from "lucide-react";
import type { Resource } from "@/api/client";
import { useTranslation } from "react-i18next";

interface ResourceSectionProps {
  resources: Resource[];
  onDelete: (id: string) => void;
  onRequestAdd: () => void;
}

export function ResourceSection({
  resources,
  onDelete,
  onRequestAdd,
}: ResourceSectionProps) {
  const { t } = useTranslation("teacherCourseDetail");
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-gray-500" />
          <CardTitle>{t("resource.title")} ({resources.length})</CardTitle>
        </div>
        <Button size="sm" variant="outline" onClick={onRequestAdd}>
          <Plus className="h-4 w-4 mr-1" /> {t("resource.addButton")}
        </Button>
      </CardHeader>
      <CardContent>
        {resources.length === 0 ? (
          <p className="py-4 text-center text-sm text-gray-400">{t("resource.empty")}</p>
        ) : (
          <div className="space-y-2">
            {resources.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">{r.title}</p>
                  {(r.file_type || r.file_size) && (
                    <p className="mt-0.5 text-xs text-gray-400">
                      {r.file_type}
                      {r.file_type && r.file_size ? " · " : ""}
                      {r.file_size}
                      {r.featured && <span className="ml-2 text-blue-500">{t("resource.featured")}</span>}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost-destructive"
                  size="icon"
                  onClick={() => {
                    if (window.confirm(t("resource.confirmDelete"))) {
                      onDelete(r.id);
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
