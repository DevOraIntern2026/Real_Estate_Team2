export const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export const isValidPhone = (value: string) =>
  /^\+?\d{8,15}$/.test(value.replace(/[\s-]/g, ""));

export type PasswordCheck = { id: string; label: string; passed: boolean };

// add a rule here (e.g. min length) and the checklist + validation update together
const PASSWORD_RULES: { id: string; label: string; test: (p: string) => boolean }[] = [
  { id: "upper", label: "Contains Capital Letter", test: (p) => /[A-Z]/.test(p) },
  { id: "number", label: "Contains Number", test: (p) => /\d/.test(p) },
  {
    id: "special",
    label: "Contains Special Character",
    test: (p) => /[^A-Za-z0-9\s]/.test(p),
  },
];

export const getPasswordChecks = (password: string): PasswordCheck[] =>
  PASSWORD_RULES.map((r) => ({
    id: r.id,
    label: r.label,
    passed: r.test(password),
  }));
