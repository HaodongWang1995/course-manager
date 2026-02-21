import { useState } from "react";
import {
  Button,
  Card,
  CardContent,
  Badge,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@course-manager/ui";
import { Edit, Save } from "lucide-react";
import type { Course } from "@/api/client";
import { useTranslation } from "react-i18next";

const statusColors: Record<string, string> = {
  active: "bg-green-50 text-green-700 border-green-200",
  draft: "bg-gray-50 text-gray-600 border-gray-200",
  archived: "bg-amber-50 text-amber-700 border-amber-200",
};

interface CourseInfoCardProps {
  course: Course;
  onSave: (data: {
    title: string;
    description?: string;
    price?: number;
    category?: string;
  }) => void;
  isSaving: boolean;
  onStatusChange: (status: string) => void;
}

export function CourseInfoCard({
  course,
  onSave,
  isSaving,
  onStatusChange,
}: CourseInfoCardProps) {
  const { t } = useTranslation("teacherCourseDetail");
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");

  const startEditing = () => {
    setTitle(course.title);
    setDescription(course.description || "");
    setPrice(String(course.price || ""));
    setCategory(course.category || "");
    setEditing(true);
  };

  const handleSave = () => {
    onSave({
      title,
      description: description || undefined,
      price: price ? parseFloat(price) : undefined,
      category: category || undefined,
    });
    setEditing(false);
  };

  return (
    <>
      {/* Action bar */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {!editing && (
            <Button variant="outline" className="gap-2" onClick={startEditing}>
              <Edit className="h-4 w-4" />
              {t("info.edit")}
            </Button>
          )}
          <Select value={course.status} onValueChange={onStatusChange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">{t("info.statusActions.active")}</SelectItem>
              <SelectItem value="draft">{t("info.statusActions.draft")}</SelectItem>
              <SelectItem value="archived">{t("info.statusActions.archived")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Course info card */}
      <Card>
        <CardContent className="p-6">
          {editing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t("info.fields.title")}</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t("info.fields.description")}</Label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="flex min-h-[100px] w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("info.fields.price")}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("info.fields.category")}</Label>
                  <Input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                  <Save className="h-4 w-4" />
                  {isSaving ? t("info.saving") : t("info.save")}
                </Button>
                <Button variant="outline" onClick={() => setEditing(false)}>
                  {t("info.cancel")}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    {course.category && (
                      <Badge variant="outline">{course.category}</Badge>
                    )}
                    <Badge
                      className={`border ${statusColors[course.status]}`}
                      variant="outline"
                    >
                      {t(`info.status.${course.status}`)}
                    </Badge>
                  </div>
                  <h1 className="mt-3 text-2xl font-bold text-gray-900">{course.title}</h1>
                </div>
                {course.price > 0 ? (
                  <div className="text-2xl font-bold text-blue-600">
                    ¥{Number(course.price).toFixed(2)}
                  </div>
                ) : (
                  <span className="text-sm font-medium text-green-600">{t("info.free")}</span>
                )}
              </div>
              {course.description && (
                <p className="mt-4 whitespace-pre-line text-sm text-gray-600">
                  {course.description}
                </p>
              )}
              <p className="mt-4 text-xs text-gray-400">
                {t("info.createdAt", { date: new Date(course.created_at).toLocaleString() })}
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}
