import { useId } from "react";
import { fieldClass, fieldErrorClass } from "./fieldStyles";

type TextFieldProps = {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  required?: boolean;
  type?: "text" | "email" | "tel";
  readOnly?: boolean;
  autoComplete?: string;
  error?: string;
};

export default function TextField({
  label,
  value,
  onChange,
  placeholder,
  multiline = false,
  required = false,
  type = "text",
  readOnly = false,
  autoComplete,
  error,
}: TextFieldProps) {
  const id = useId();
  const errorId = useId();

  const shared = {
    id,
    value,
    required,
    placeholder,
    readOnly,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? errorId : undefined,
    className: `${fieldClass} ${error ? fieldErrorClass : ""}`,
  };

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium">
        {label}
      </label>
      {multiline ? (
        <textarea
          rows={3}
          {...shared}
          onChange={(e) => onChange?.(e.target.value)}
        />
      ) : (
        <input
          type={type}
          autoComplete={autoComplete}
          {...shared}
          onChange={(e) => onChange?.(e.target.value)}
        />
      )}
      {error && (
        <p id={errorId} className="mt-1 text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
