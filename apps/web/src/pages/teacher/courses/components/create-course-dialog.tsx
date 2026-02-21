import {
  Button,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@course-manager/ui";
import { FormTextField, FormTextareaField, FormSelectField } from "@/components/form-field";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation("teacherCourses");
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
        <DialogTitle>{t("createDialog.title")}</DialogTitle>
        <DialogDescription>{t("subtitle")}</DialogDescription>
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
              label={t("createDialog.fields.title")}
              required
              placeholder={t("createDialog.placeholders.title")}
              autoFocus
            />
          )}
        </form.Field>

        <form.Field name="description">
          {(field) => (
            <FormTextareaField
              field={field}
              label={t("createDialog.fields.description")}
              placeholder={t("createDialog.placeholders.description")}
            />
          )}
        </form.Field>

        <div className="grid grid-cols-2 gap-4">
          <form.Field name="price">
            {(field) => (
              <FormTextField
                field={field}
                label={t("createDialog.fields.price")}
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
                label={t("createDialog.fields.category")}
                placeholder={t("createDialog.placeholders.category")}
              />
            )}
          </form.Field>
        </div>

        <form.Field name="status">
          {(field) => (
            <FormSelectField
              field={field}
              label={t("createDialog.fields.status")}
              options={[
                { value: "active", label: t("createDialog.statusOptions.active") },
                { value: "draft", label: t("createDialog.statusOptions.draft") },
              ]}
            />
          )}
        </form.Field>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            {t("createDialog.cancel")}
          </Button>
          <Button type="submit" disabled={isLoading} className="min-w-[100px]">
            {isLoading ? t("createDialog.submitting") : t("createDialog.submit")}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
