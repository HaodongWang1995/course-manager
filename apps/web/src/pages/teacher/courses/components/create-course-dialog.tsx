import {
  Button,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@course-manager/ui";
import { FormTextField, FormTextareaField, FormSelectField } from "@/components/form-field";
import { useForm } from "@tanstack/react-form";
import { courseFormValidator } from "@/lib/schemas";

interface CreateCourseDialogProps {
  onAdd: (data: {
    title: string;
    description?: string;
    price?: number;
    category?: string;
    status?: string;
  }) => void;
  onClose: () => void;
  isLoading: boolean;
}

export function CreateCourseDialog({
  onAdd,
  onClose,
  isLoading,
}: CreateCourseDialogProps) {
  const form = useForm({
    defaultValues: {
      title: "",
      description: "" as string | undefined,
      price: undefined as number | undefined,
      category: "" as string | undefined,
      status: "active" as "active" | "draft",
    },
    validators: {
      onChange: courseFormValidator,
    },
    onSubmit: ({ value }) => {
      onAdd({
        title: value.title,
        description: value.description || undefined,
        price: value.price,
        category: value.category || undefined,
        status: value.status,
      });
      form.reset();
    },
  });

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>新建课程</DialogTitle>
        <DialogDescription>填写课程基本信息，创建后可继续编辑详情</DialogDescription>
      </DialogHeader>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="space-y-5"
      >
        <form.Field name="title">
          {(field) => (
            <FormTextField
              field={field}
              label="课程标题"
              required
              placeholder="例如: 线性代数"
              autoFocus
            />
          )}
        </form.Field>

        <form.Field name="description">
          {(field) => (
            <FormTextareaField
              field={field}
              label="课程描述"
              placeholder="简要介绍课程内容和目标..."
            />
          )}
        </form.Field>

        <div className="grid grid-cols-2 gap-4">
          <form.Field name="price">
            {(field) => (
              <FormTextField
                field={field}
                label="价格 (¥)"
                type="number"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            )}
          </form.Field>

          <form.Field name="category">
            {(field) => (
              <FormTextField
                field={field}
                label="分类"
                placeholder="例如: 数学"
              />
            )}
          </form.Field>
        </div>

        <form.Field name="status">
          {(field) => (
            <FormSelectField
              field={field}
              label="发布状态"
              options={[
                { value: "active", label: "立即上架" },
                { value: "draft", label: "保存为草稿" },
              ]}
            />
          )}
        </form.Field>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button type="submit" disabled={isLoading} className="min-w-[100px]">
            {isLoading ? "创建中..." : "创建课程"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
