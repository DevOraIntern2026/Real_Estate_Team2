import { useId, useState } from "react";
import { fieldClass, fieldErrorClass } from "./fieldStyles";

type PasswordFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: "current-password" | "new-password";
  error?: string;
};

export default function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
  error,
}: PasswordFieldProps) {
  const id = useId();
  const errorId = useId();
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`${fieldClass} pe-11 ${error ? fieldErrorClass : ""}`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute end-3 top-1/2 -translate-y-1/2 text-[#241A12]"
        >
          <i className={`fa-regular ${visible ? "fa-eye" : "fa-eye-slash"}`} />
        </button>
      </div>
      {error && (
        <p id={errorId} className="mt-1 text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
