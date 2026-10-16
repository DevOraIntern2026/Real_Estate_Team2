import { ApiError } from "./ApiError";

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

type Rec = Record<string, unknown>;
const isRecord = (v: unknown): v is Rec => typeof v === "object" && v !== null && !Array.isArray(v);

const ITEM_KEYS = ["items", "data", "listings", "results", "docs", "rows"];
const META_KEYS = ["meta", "pagination", "paging"];

function firstNumber(sources: Rec[], keys: string[]): number | undefined {
  for (const source of sources) {
    for (const key of keys) {
      const n = Number(source[key]);
      if (source[key] !== undefined && source[key] !== null && Number.isFinite(n)) return n;
    }
  }
  return undefined;
}

/**
 * The Swagger text didn't show the response body of the list endpoints, so this accepts the
 * common shapes: a bare array, or { items|data|listings|results|docs|rows: [...] } with the
 * numbers either on the object itself or inside { meta | pagination }.
 * ONE place to change once you see the real response.
 */
export function normalizePaginated<T>(
  raw: unknown,
  requested: { page: number; limit: number }
): Paginated<T> {
  let items: T[] | undefined;
  const metaSources: Rec[] = [];

  if (Array.isArray(raw)) {
    items = raw as T[];
  } else if (isRecord(raw)) {
    for (const key of ITEM_KEYS) {
      if (Array.isArray(raw[key])) {
        items = raw[key] as T[];
        break;
      }
    }
    for (const key of META_KEYS) if (isRecord(raw[key])) metaSources.push(raw[key] as Rec);
    metaSources.push(raw);
  }

  if (!items) {
    if (import.meta.env?.DEV) console.warn("[api] Unrecognized list response:", raw);
    throw new ApiError(500, "Unexpected response from the server.", raw);
  }

  const limit = firstNumber(metaSources, ["limit", "pageSize", "perPage", "per_page"]) ?? requested.limit;
  const page = firstNumber(metaSources, ["page", "currentPage", "current_page"]) ?? requested.page;
  const total =
    firstNumber(metaSources, ["total", "totalItems", "totalCount", "count", "total_count"]) ??
    (page - 1) * limit + items.length;
  const totalPages =
    firstNumber(metaSources, ["totalPages", "pages", "lastPage", "total_pages", "last_page"]) ??
    Math.max(1, Math.ceil(total / limit));

  return { items, total, page, limit, totalPages };
}
