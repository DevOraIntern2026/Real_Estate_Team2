import { useId } from "react";
import type { Option } from "./FilterDropdown";

type SelectFieldProps<T extends string> = {
  label: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
};

export default function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: SelectFieldProps<T>) {
  const id = useId();

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
          className="w-full appearance-none rounded-sm border-[0.8px] border-[#87400E] bg-transparent px-3 py-2.5 pe-9 text-sm text-[#241A12] outline-none"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <i className="fa-solid fa-chevron-down pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-xs text-[#87400E]" />
      </div>
    </div>
  );
}
