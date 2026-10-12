import { useCallback, useRef, useState } from "react";
import { useClickOutside } from "../../../../hooks/useClickOutside";

export type Option<T extends string> = { label: string; value: T };

type FilterDropdownProps<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

export default function FilterDropdown<T extends string>({
  options,
  value,
  onChange,
  className = "w-44",
}: FilterDropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useClickOutside(ref, close);

  const current = options.find((o) => o.value === value)?.label ?? "";

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full items-center justify-center gap-2 rounded-sm bg-[#87400E] px-3 py-2 text-sm font-medium text-[#FAFAFA]"
      >
        {current}
        <i className="fa-solid fa-chevron-down text-xs" />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute end-0 z-20 mt-1 w-full rounded-sm border-[0.8px] border-[#87400E]/30 bg-white py-1 shadow-md"
        >
          {options.map((opt) => (
            <li key={opt.value}>
              <button
                type="button"
                role="option"
                aria-selected={opt.value === value}
                onClick={() => {
                  onChange(opt.value);
                  close();
                }}
                className={`w-full px-3 py-1.5 text-start text-sm hover:bg-[#F3E9E0] ${
                  opt.value === value
                    ? "font-medium text-[#87400E]"
                    : "text-[#5A4F49]"
                }`}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
