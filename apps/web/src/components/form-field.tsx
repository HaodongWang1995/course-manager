import type { FieldApi } from "@tanstack/react-form";
import {
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@course-manager/ui";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function FieldError({ field }: { field: FieldApi<any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any> }) {
  const errors = field.state.meta.errors;
  if (!errors.length) return null;
  return (
    <p className="text-xs text-red-500 mt-1">
      {errors.map((e: unknown) => (typeof e === "string" ? e : (e as { message?: string })?.message ?? String(e))).join(", ")}
    </p>
  );
}

interface FieldWrapperProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: FieldApi<any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any>;
}

function FieldWrapper({ label, required, children, field }: FieldWrapperProps) {
  return (
    <div className="space-y-2">
      <Label variant="muted">
        {label} {required && <span className="text-red-400">*</span>}
      </Label>
      {children}
      <FieldError field={field} />
    </div>
  );
}

interface TextFieldProps {
  label: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: FieldApi<any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any>;
  className?: string;
  autoFocus?: boolean;
  step?: string;
  min?: string;
}

export function FormTextField({
  label,
  required,
  placeholder,
  type = "text",
  field,
  className,
  autoFocus,
  step,
  min,
}: TextFieldProps) {
  return (
    <FieldWrapper label={label} required={required} field={field}>
      <Input
        type={type}
        placeholder={placeholder}
        value={field.state.value ?? ""}
        onChange={(e) => {
          if (type === "number") {
            const val = e.target.value;
            field.handleChange(val === "" ? undefined : parseFloat(val));
          } else {
            field.handleChange(e.target.value);
          }
        }}
        onBlur={field.handleBlur}
        className={className}
        autoFocus={autoFocus}
        step={step}
        min={min}
      />
    </FieldWrapper>
  );
}

interface TextareaFieldProps {
  label: string;
  required?: boolean;
  placeholder?: string;
  rows?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: FieldApi<any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any>;
}

export function FormTextareaField({
  label,
  required,
  placeholder,
  rows = 3,
  field,
}: TextareaFieldProps) {
  return (
    <FieldWrapper label={label} required={required} field={field}>
      <textarea
        placeholder={placeholder}
        value={field.state.value ?? ""}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
        rows={rows}
        className="flex w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      />
    </FieldWrapper>
  );
}

interface SelectFieldProps {
  label: string;
  required?: boolean;
  options: { value: string; label: string }[];
  placeholder?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: FieldApi<any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any>;
}

export function FormSelectField({
  label,
  required,
  options,
  placeholder,
  field,
}: SelectFieldProps) {
  return (
    <FieldWrapper label={label} required={required} field={field}>
      <Select value={field.state.value ?? ""} onValueChange={field.handleChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FieldWrapper>
  );
}

interface DateTimeFieldProps {
  label: string;
  required?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: FieldApi<any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any>;
}

export function FormDateTimeField({ label, required, field }: DateTimeFieldProps) {
  return (
    <FieldWrapper label={label} required={required} field={field}>
      <Input
        type="datetime-local"
        value={field.state.value ?? ""}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
      />
    </FieldWrapper>
  );
}
