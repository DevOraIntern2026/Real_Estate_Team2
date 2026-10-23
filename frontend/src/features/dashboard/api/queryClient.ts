import { QueryClient } from "@tanstack/react-query";
import { isApiError } from "./ApiError";

/** 4xx errors (401, 403, 404...) won't be fixed by retrying; network/5xx errors get 2 retries. */
export function shouldRetry(failureCount: number, error: unknown): boolean {
  if (isApiError(error) && error.status >= 400 && error.status < 500) return false;
  return failureCount < 2;
}

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: shouldRetry, staleTime: 30_000, refetchOnWindowFocus: false },
    },
  });
}

export const queryClient = createQueryClient();
