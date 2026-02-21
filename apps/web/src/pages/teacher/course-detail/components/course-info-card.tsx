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

const statusLabels: Record<string, string> = {
  active: "已上架",
  draft: "草稿",
  archived: "已下架",
};

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
              编辑
            </Button>
          )}
          <Select value={course.status} onValueChange={onStatusChange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">上架</SelectItem>
              <SelectItem value="draft">草稿</SelectItem>
              <SelectItem value="archived">下架</SelectItem>
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
                <Label>课程标题</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>课程描述</Label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="flex min-h-[100px] w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>价格 (¥)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>分类</Label>
                  <Input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                  <Save className="h-4 w-4" />
                  {isSaving ? "保存中..." : "保存"}
                </Button>
                <Button variant="outline" onClick={() => setEditing(false)}>
                  取消
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
                      {statusLabels[course.status]}
                    </Badge>
                  </div>
                  <h1 className="mt-3 text-2xl font-bold text-gray-900">{course.title}</h1>
                </div>
                {course.price > 0 ? (
                  <div className="text-2xl font-bold text-blue-600">
                    ¥{Number(course.price).toFixed(2)}
                  </div>
                ) : (
                  <span className="text-sm font-medium text-green-600">免费</span>
                )}
              </div>
              {course.description && (
                <p className="mt-4 whitespace-pre-line text-sm text-gray-600">
                  {course.description}
                </p>
              )}
              <p className="mt-4 text-xs text-gray-400">
                创建于 {new Date(course.created_at).toLocaleString("zh-CN")}
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}
