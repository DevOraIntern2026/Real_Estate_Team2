export interface TokenInfo {
  present: boolean;
  length?: number;
  looksLikeJwt?: boolean; // 3 parts separated by dots
  startsWithBearer?: boolean; // the stored value already contains "Bearer " (would be sent twice)
  decodable?: boolean;
  expiresAt?: string;
  expired?: boolean;
  role?: unknown;
  subject?: unknown;
}

function decodePayload(part: string): Record<string, unknown> | null {
  try {
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    return JSON.parse(atob(padded)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** Describes a token WITHOUT revealing it: is it a JWT, is it expired, which role is inside. */
export function describeToken(token: string | null): TokenInfo {
  if (!token) return { present: false };

  const parts = token.split(".");
  const info: TokenInfo = {
    present: true,
    length: token.length,
    looksLikeJwt: parts.length === 3,
    startsWithBearer: /^bearer\s/i.test(token),
  };
  if (parts.length !== 3) return info;

  const payload = decodePayload(parts[1]);
  if (!payload) return { ...info, decodable: false };

  const exp = typeof payload.exp === "number" ? payload.exp * 1000 : undefined;
  return {
    ...info,
    decodable: true,
    expiresAt: exp ? new Date(exp).toISOString() : undefined,
    expired: exp ? exp < Date.now() : undefined,
    role: payload.role ?? payload.roles ?? payload.type,
    subject: payload.sub ?? payload.id ?? payload.userId,
  };
}
