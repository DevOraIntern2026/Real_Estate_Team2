// The names your login uses.
const ACCESS_KEY = "ACCESS_TOKEN";
const SESSION_KEY = "AUTH_SESSION";
const ALL_KEYS = ["ACCESS_TOKEN", "REFRESH_TOKEN", "AUTH_SESSION"];

// sessionStorage FIRST (where your login keeps the token), then localStorage as a fallback
const STORES: (() => Storage)[] = [() => sessionStorage, () => localStorage];

function read(store: () => Storage, key: string): string | null {
  try {
    return store().getItem(key);
  } catch {
    return null; // storage blocked (private mode, etc.)
  }
}

/**
 * Cleans what the login saved:
 *  - JSON.stringify quotes:  "\"eyJ...\""  ->  eyJ...
 *  - a stored "Bearer " prefix (the client adds its own, so it would be sent twice: "Bearer Bearer eyJ...")
 */
function clean(value: string | null): string | null {
  if (!value) return null;
  let v = value.trim();
  if (v.startsWith('"') && v.endsWith('"')) {
    try {
      const parsed: unknown = JSON.parse(v);
      if (typeof parsed !== "string") return null;
      v = parsed.trim();
    } catch {
      return null;
    }
  }
  v = v.replace(/^bearer\s+/i, "");
  return v || null;
}

/**
 * FALLBACK (a guess): if ACCESS_TOKEN is missing but AUTH_SESSION holds JSON like
 * { accessToken | access_token | token: "eyJ..." }, use that token.
 */
function tokenFromSession(value: string | null): string | null {
  if (!value) return null;
  try {
    const session: unknown = JSON.parse(value);
    if (typeof session === "object" && session !== null) {
      for (const key of ["accessToken", "access_token", "token"]) {
        const t = (session as Record<string, unknown>)[key];
        if (typeof t === "string" && t) return t;
      }
    }
  } catch {
    /* not JSON */
  }
  return null;
}

export const tokenStorage = {
  /** the access token */
  get(): string | null {
    for (const store of STORES) {
      const token = clean(read(store, ACCESS_KEY)) ?? tokenFromSession(read(store, SESSION_KEY));
      if (token) return token;
    }
    return null;
  },
  /** saved in sessionStorage (cleared when the tab closes) */
  set(token: string): void {
    try {
      sessionStorage.setItem(ACCESS_KEY, token);
    } catch {
      /* ignore */
    }
  },
  /** logout / expired session: remove ALL the login's keys from both storages */
  clear(): void {
    for (const key of ALL_KEYS) {
      for (const store of STORES) {
        try {
          store().removeItem(key);
        } catch {
          /* ignore */
        }
      }
    }
  },
};
