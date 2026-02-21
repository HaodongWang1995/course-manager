import { useTranslation } from "react-i18next";
import { useForm } from "@tanstack/react-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Avatar,
  AvatarFallback,
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@course-manager/ui";
import {
  Save,
  Send,
  Paperclip,
  FileText,
  Plus,
  AtSign,
  Calendar,
  X,
  Download,
  Bold,
  Italic,
  List,
  LinkIcon,
  CheckCircle2,
  Clock,
  ChevronDown,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useFeedbackDraft, useSaveFeedbackDraft, usePublishFeedback } from "@/hooks/use-queries";
import { FormTextField, FormTextareaField } from "@/components/form-field";

const presentStudents = [
  { name: "Sarah", initials: "SA", color: "bg-violet-500" },
  { name: "James", initials: "JA", color: "bg-blue-500" },
  { name: "Emily", initials: "EM", color: "bg-emerald-500" },
  { name: "Michael", initials: "MI", color: "bg-amber-500" },
  { name: "Alex", initials: "AL", color: "bg-rose-500" },
];

interface FeedbackEditorPageProps {
  courseId: string;
}

export function FeedbackEditorPage({ courseId }: FeedbackEditorPageProps) {
  const { t } = useTranslation("feedback");
  const { data: draft } = useFeedbackDraft(courseId);
  const saveDraftMutation = useSaveFeedbackDraft();
  const publishMutation = usePublishFeedback();

  const [requirementsOpen, setRequirementsOpen] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const form = useForm({
    defaultValues: {
      requirements: "",
      feedback: "",
      assignmentTitle: "",
      dueDate: "",
    },
  });

  useEffect(() => {
    if (draft) {
      form.setFieldValue("requirements", (draft.requirements || []).join("\n"));
      form.setFieldValue("feedback", draft.summary || "");
      form.setFieldValue("assignmentTitle", draft.assignment_title || "");
      form.setFieldValue("dueDate", draft.due_date || "");
    }
  }, [draft]);

  const values = form.state.values;

  useEffect(() => {
    if (!isDirty) return;
    setSaveStatus("saving");
    const timer = setTimeout(() => {
      saveDraftMutation.mutate(
        {
          course_id: courseId,
          summary: values.feedback || undefined,
          quote: undefined,
          requirements: values.requirements ? values.requirements.split("\n").filter(Boolean) : [],
          assignment_title: values.assignmentTitle || undefined,
          due_date: values.dueDate || undefined,
        },
        {
          onSuccess: () => {
            setSaveStatus("saved");
            setLastSaved(new Date());
            setIsDirty(false);
          },
        },
      );
    }, 1500);
    return () => clearTimeout(timer);
  }, [isDirty, values.feedback, values.requirements, values.assignmentTitle, values.dueDate, courseId]);

  const buildPayload = () => ({
    course_id: courseId,
    summary: values.feedback || undefined,
    quote: undefined,
    requirements: values.requirements ? values.requirements.split("\n").filter(Boolean) : [],
    assignment_title: values.assignmentTitle || undefined,
    due_date: values.dueDate || undefined,
  });

  const handleSaveDraft = () => {
    saveDraftMutation.mutate(buildPayload(), {
      onSuccess: () => {
        setSaveStatus("saved");
        setLastSaved(new Date());
        setIsDirty(false);
      },
    });
  };

  const handlePublish = () => {
    saveDraftMutation.mutate(buildPayload(), {
      onSuccess: (data) => {
        if (data?.id) {
          publishMutation.mutate(data.id);
        }
        setSaveStatus("saved");
        setLastSaved(new Date());
        setIsDirty(false);
      },
    });
  };

  const markDirty = () => setIsDirty(true);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                  Advanced Mathematics
                </h1>
                <Badge className={draft?.published ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}>
                  {draft?.published ? t("status.published") : t("status.draft")}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                {t("courseId")} {courseId} &middot; Session #12
              </p>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <div className="flex h-6 items-center">
                {saveStatus === "saving" && (
                  <span className="flex items-center gap-1.5 text-xs text-gray-400">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gray-400" />
                    {t("saving")}
                  </span>
                )}
                {saveStatus === "saved" && (
                  <span className="flex items-center gap-1.5 text-xs text-emerald-600">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {t("draftSaved")}
                    {lastSaved && (
                      <span className="text-gray-400">
                        · {lastSaved.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
                      </span>
                    )}
                  </span>
                )}
                {saveStatus === "idle" && (
                  <span className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Clock className="h-3.5 w-3.5" />
                    Last edited Oct 20, 2023 at 3:45 PM
                  </span>
                )}
              </div>
              <div className="text-right text-sm text-gray-500">
                <p>
                  <span className="font-medium text-gray-700">{t("date")}</span> Oct 20, 2023
                </p>
                <p>
                  <span className="font-medium text-gray-700">{t("time")}</span> 10:00 AM - 11:30 AM
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Present Students */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              {t("presentStudents")}
            </CardTitle>
            <p className="text-xs text-gray-500">
              {presentStudents.length} {t("studentsPresent")}
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {presentStudents.map((student) => (
                <div key={student.name} className="flex shrink-0 flex-col items-center gap-1.5">
                  <Avatar className="h-12 w-12 ring-2 ring-white shadow-sm">
                    <AvatarFallback className={`${student.color} text-sm font-medium text-white`}>
                      {student.initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium text-gray-600">{student.name}</span>
                </div>
              ))}
              <div className="flex shrink-0 flex-col items-center gap-1.5">
                <button className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed border-gray-300 text-gray-400 transition-colors hover:border-blue-400 hover:text-blue-500">
                  <Plus className="h-5 w-5" />
                </button>
                <span className="text-xs text-gray-400">{t("add")}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course Requirements */}
        <Collapsible open={requirementsOpen} onOpenChange={setRequirementsOpen} className="mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CollapsibleTrigger asChild>
                <button className="flex w-full items-center justify-between text-left">
                  <div>
                    <CardTitle className="text-sm font-semibold">{t("courseRequirements")}</CardTitle>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {t("requirementsDesc")}
                    </p>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${requirementsOpen ? "rotate-180" : ""}`}
                  />
                </button>
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent>
                <form.Field name="requirements">
                  {(field) => (
                    <div onChange={markDirty}>
                      <FormTextareaField
                        label=""
                        placeholder={t("preClassInstructions")}
                        rows={5}
                        field={field}
                      />
                    </div>
                  )}
                </form.Field>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Post-Class Feedback */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">{t("postClassFeedback")}</CardTitle>
            <p className="text-xs text-gray-500">{t("postClassFeedbackDesc")}</p>
          </CardHeader>
          <CardContent>
            <div className="mb-2 flex items-center gap-1 rounded-t-lg border border-b-0 border-gray-300 bg-gray-50 px-2 py-1.5">
              <button className="rounded p-1.5 text-gray-500 hover:bg-gray-200 hover:text-gray-700">
                <Bold className="h-4 w-4" />
              </button>
              <button className="rounded p-1.5 text-gray-500 hover:bg-gray-200 hover:text-gray-700">
                <Italic className="h-4 w-4" />
              </button>
              <button className="rounded p-1.5 text-gray-500 hover:bg-gray-200 hover:text-gray-700">
                <List className="h-4 w-4" />
              </button>
              <button className="rounded p-1.5 text-gray-500 hover:bg-gray-200 hover:text-gray-700">
                <LinkIcon className="h-4 w-4" />
              </button>
              <div className="mx-1 h-5 w-px bg-gray-300" />
              <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs text-blue-600 hover:text-blue-800">
                <AtSign className="h-3.5 w-3.5" />
                {t("mention")}
              </Button>
            </div>
            <form.Field name="feedback">
              {(field) => (
                <div onChange={markDirty}>
                  <FormTextareaField
                    label=""
                    placeholder={t("feedbackPlaceholder")}
                    rows={7}
                    field={field}
                  />
                </div>
              )}
            </form.Field>
          </CardContent>
        </Card>

        {/* Materials Shared */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">{t("materialsShared")}</CardTitle>
            <p className="text-xs text-gray-500">{t("materialsDesc")}</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                  <FileText className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Calculus_Ch4_Notes.pdf</p>
                  <p className="text-xs text-gray-500">2.4 MB &middot; Uploaded Oct 20, 2023</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon-sm">
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="ghost-destructive" size="icon-sm">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <button className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-4 py-4 text-sm font-medium text-gray-500 transition-colors hover:border-blue-400 hover:bg-blue-50/50 hover:text-blue-600">
              <Paperclip className="h-4 w-4" />
              {t("attachFileOrLink")}
            </button>
          </CardContent>
        </Card>

        {/* Homework */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">{t("homework")}</CardTitle>
            <p className="text-xs text-gray-500">{t("homeworkDesc")}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <form.Field name="assignmentTitle">
              {(field) => (
                <div onChange={markDirty}>
                  <FormTextField
                    label={t("assignmentTitle")}
                    placeholder={t("assignmentTitlePlaceholder")}
                    field={field}
                  />
                </div>
              )}
            </form.Field>
            <form.Field name="dueDate">
              {(field) => (
                <div onChange={markDirty}>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">{t("dueDate")}</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="mm/dd/yyyy"
                        value={field.state.value ?? ""}
                        onChange={(e) => { field.handleChange(e.target.value); markDirty(); }}
                        onBlur={field.handleBlur}
                        className="flex w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>
                </div>
              )}
            </form.Field>
          </CardContent>
        </Card>

        {/* Bottom Action Bar */}
        <div className="sticky bottom-0 -mx-4 border-t border-gray-200 bg-white/95 px-4 py-4 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleSaveDraft}
              disabled={saveDraftMutation.isPending}
            >
              <Save className="h-4 w-4" />
              {saveDraftMutation.isPending ? t("saving") : t("saveDraft")}
            </Button>
            <Button
              className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700"
              onClick={handlePublish}
              disabled={publishMutation.isPending}
            >
              <Send className="h-4 w-4" />
              {publishMutation.isPending ? t("saving") : t("saveAndPublish")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
