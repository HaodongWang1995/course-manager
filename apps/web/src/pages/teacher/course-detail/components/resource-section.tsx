import { Button, Card, CardContent, CardHeader, CardTitle } from "@course-manager/ui";
import { FileText, Plus, Trash2 } from "lucide-react";
import type { Resource } from "@/api/client";

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
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-gray-500" />
          <CardTitle>课程资源 ({resources.length})</CardTitle>
        </div>
        <Button size="sm" variant="outline" onClick={onRequestAdd}>
          <Plus className="h-4 w-4 mr-1" /> 添加资源
        </Button>
      </CardHeader>
      <CardContent>
        {resources.length === 0 ? (
          <p className="py-4 text-center text-sm text-gray-400">暂无课程资源</p>
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
                      {r.featured && <span className="ml-2 text-blue-500">精选</span>}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost-destructive"
                  size="icon"
                  onClick={() => {
                    if (window.confirm("确定要删除此资源吗？")) {
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
