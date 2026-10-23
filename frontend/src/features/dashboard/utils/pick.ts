type Rec = Record<string, unknown>;

export const isRecord = (v: unknown): v is Rec =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const isEmpty = (v: unknown) => v === undefined || v === null || v === "";

/** First non-empty value among several possible paths: pick(item, "customerName", "customer.name") */
export function pick(source: unknown, ...paths: string[]): unknown {
  for (const path of paths) {
    let current: unknown = source;
    for (const key of path.split(".")) {
      current = isRecord(current) ? current[key] : undefined;
    }
    if (!isEmpty(current)) return current;
  }
  return undefined;
}

export const pickString = (source: unknown, ...paths: string[]): string | undefined => {
  const v = pick(source, ...paths);
  return v === undefined ? undefined : String(v);
};

export const pickNumber = (source: unknown, ...paths: string[]): number | undefined => {
  const v = Number(pick(source, ...paths));
  return Number.isFinite(v) ? v : undefined;
};

/** An array, or { items | data | results: [...] }, or [] */
export function listOf(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (isRecord(value)) {
    for (const key of ["items", "data", "results", "rows"]) {
      if (Array.isArray(value[key])) return value[key] as unknown[];
    }
  }
  return [];
}
