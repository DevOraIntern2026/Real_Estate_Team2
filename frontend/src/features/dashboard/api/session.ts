import { setUnauthorizedHandler } from "./httpClient";
import { queryClient } from "./queryClient";
import { tokenStorage } from "./tokenStorage";

/**
 * When ANY request gets a 401 (expired / invalid token): forget the token,
 * drop every cached response, and go to the login page. Call once in main.tsx.
 */
export function installUnauthorizedRedirect(loginPath: string) {
  setUnauthorizedHandler(() => {
    tokenStorage.clear();
    queryClient.clear();
    if (window.location.pathname !== loginPath) window.location.assign(loginPath);
  });
}
