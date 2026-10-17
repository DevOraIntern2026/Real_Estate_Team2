import { ApiError } from "./ApiError";
import { tokenStorage } from "./tokenStorage";

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

export type QueryParams = Record<string, string | number | boolean | null | undefined>;

export type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  query?: QueryParams;
  /** object -> sent as JSON, FormData -> sent as-is (file uploads) */
  body?: unknown;
  signal?: AbortSignal;
  /** false for login/register: no token is sent, and a 401 is NOT "session expired" */
  auth?: boolean;
};

let onUnauthorized: (() => void) | null = null;

/** Called once when the server says the session is invalid (401). Use it to log out + redirect. */
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

function buildUrl(path: string, query?: QueryParams): string {
  const url = `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  if (!query) return url;

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  }
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

async function readBody(res: Response): Promise<unknown> {
  if (res.status === 204) return undefined;
  const text = await res.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * Different backends name the message field differently. Yours returns { "Error": "..." }
 * (capital E), so the match ignores upper/lower case.
 */
function messageFrom(body: unknown, fallback: string): string {
  if (body && typeof body === "object") {
    const entries = Object.entries(body as Record<string, unknown>);
    for (const wanted of ["message", "error", "detail", "title"]) {
      const hit = entries.find(
        ([key, value]) => key.toLowerCase() === wanted && typeof value === "string" && value
      );
      if (hit) return hit[1] as string;
    }
  }
  if (typeof body === "string" && body) return body;
  return fallback;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", query, body, signal, auth = true } = options;

  const headers: Record<string, string> = { Accept: "application/json" };
  let payload: BodyInit | undefined;

  if (body instanceof FormData) {
    payload = body; // the browser sets the multipart boundary itself
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  if (auth) {
    const token = tokenStorage.get();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(buildUrl(path, query), { method, headers, body: payload, signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err; // cancelled on purpose
    throw new ApiError(0, "Network error. Check your connection and try again.");
  }

  const data = await readBody(res);

  if (!res.ok) {
    if (res.status === 401 && auth) onUnauthorized?.();
    throw new ApiError(res.status, messageFrom(data, res.statusText || "Request failed"), data);
  }

  return data as T;
}

export const api = {
  get: <T>(path: string, query?: QueryParams, opts?: Omit<RequestOptions, "method" | "query" | "body">) =>
    request<T>(path, { ...opts, method: "GET", query }),
  post: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...opts, method: "POST", body }),
  put: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...opts, method: "PUT", body }),
  patch: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...opts, method: "PATCH", body }),
  delete: <T>(path: string, opts?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...opts, method: "DELETE" }),
};
