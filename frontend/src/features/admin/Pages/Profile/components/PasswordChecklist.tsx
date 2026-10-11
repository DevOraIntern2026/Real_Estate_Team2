import type { PasswordCheck } from "../validation";

export default function PasswordChecklist({ checks }: { checks: PasswordCheck[] }) {
  return (
    <ul className="space-y-2 text-sm">
      {checks.map((c) => (
        <li key={c.id} className="flex items-center gap-2">
          <span
            className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] text-white ${
              c.passed ? "bg-green-500" : "bg-red-500"
            }`}
          >
            <i
              className={`fa-solid ${c.passed ? "fa-check" : "fa-xmark"}`}
              aria-hidden="true"
            />
          </span>
          <span className="sr-only">{c.passed ? "Met: " : "Not met: "}</span>
          {c.label}
        </li>
      ))}
    </ul>
  );
}
