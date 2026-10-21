import {
  clearAuthTokens,
  getAccessToken,
} from "@/services/api/tokenStorage";

const KEY = "ACCESS_TOKEN";

// localStorage is simple, but any XSS bug can read it. If the backend can set an
// httpOnly cookie instead, prefer that and delete this file (see the notes in the chat).
export const tokenStorage = {
  get(): string | null {
    try {
      // Login can persist the token in either storage depending on "Remember me".
      // Use the same source as the rest of the app instead of assuming sessionStorage.
      return getAccessToken();
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
      clearAuthTokens();
    } catch {
      /* ignore */
    }
  },
};
