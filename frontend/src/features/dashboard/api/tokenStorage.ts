const KEY = "ACCESS_TOKEN";

// localStorage is simple, but any XSS bug can read it. If the backend can set an
// httpOnly cookie instead, prefer that and delete this file (see the notes in the chat).
export const tokenStorage = {
  get(): string | null {
    try {
      return sessionStorage.getItem(KEY);
    } catch {
      return null; // storage blocked (private mode, etc.)
    }
  },
  set(token: string): void {
    try {
      sessionStorage.setItem(KEY, token);
    } catch {
      /* ignore */
    }
  },
  clear(): void {
    try {
      sessionStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  },
};
