/** Every failed request becomes one of these, so the UI handles ONE kind of error. */
export class ApiError extends Error {
  readonly status: number; // HTTP status, or 0 when there was no response (network down)
  readonly details?: unknown; // the raw error body from the server (e.g. field errors)

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export const isApiError = (err: unknown): err is ApiError => err instanceof ApiError;

/** Safe text to show the user for ANY thrown value. */
export function getErrorMessage(err: unknown, fallback = "Something went wrong."): string {
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
