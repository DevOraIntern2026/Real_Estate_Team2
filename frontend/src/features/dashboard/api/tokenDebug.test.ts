import { afterEach, expect, test, vi } from "vitest";
import { api } from "./index";
import { describeToken } from "./tokenDebug";
import { tokenStorage } from "./tokenStorage";

const b64 = (o: unknown) => btoa(JSON.stringify(o)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const jwt = (payload: Record<string, unknown>) => `${b64({ alg: "HS256" })}.${b64(payload)}.sig`;
const future = Math.floor(Date.now() / 1000) + 3600;
const past = Math.floor(Date.now() / 1000) - 3600;

afterEach(() => { localStorage.clear(); sessionStorage.clear(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

test("describeToken: valid, expired, not a JWT, undecodable, missing, never contains the token", () => {
  const ok = describeToken(jwt({ exp: future, role: "owner", sub: "u1" }));
  expect(ok).toMatchObject({ present: true, looksLikeJwt: true, decodable: true, expired: false, role: "owner", subject: "u1" });

  expect(describeToken(jwt({ exp: past }))).toMatchObject({ expired: true });
  expect(describeToken("justastring")).toMatchObject({ present: true, looksLikeJwt: false });
  expect(describeToken("a.%%%.c")).toMatchObject({ looksLikeJwt: true, decodable: false });
  expect(describeToken("Bearer eyJ.a.b")).toMatchObject({ startsWithBearer: true });
  expect(describeToken(null)).toEqual({ present: false });
  expect(JSON.stringify(describeToken(jwt({ exp: future })))).not.toContain("sig");
});

test("a stored 'Bearer ' prefix and JSON quotes are removed (no 'Bearer Bearer')", async () => {
  sessionStorage.setItem("ACCESS_TOKEN", "Bearer abc.def.ghi");
  expect(tokenStorage.get()).toBe("abc.def.ghi");
  sessionStorage.setItem("ACCESS_TOKEN", JSON.stringify("Bearer abc.def.ghi"));
  expect(tokenStorage.get()).toBe("abc.def.ghi");

  const fetchMock = vi.fn(() => Promise.resolve(new Response("{}", { status: 200, headers: { "Content-Type": "application/json" } })));
  vi.stubGlobal("fetch", fetchMock);
  await api.get("/dashboard");
  const sent = (fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].headers as Record<string, string>;
  expect(sent.Authorization).toBe("Bearer abc.def.ghi");
});

test("a 401 prints a dev diagnosis: server message, header sent?, token expired?", async () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  sessionStorage.setItem("ACCESS_TOKEN", jwt({ exp: past, role: "admin" }));
  vi.stubGlobal("fetch", vi.fn(() =>
    Promise.resolve(new Response(JSON.stringify({ Error: "Invalid token" }), { status: 401, headers: { "Content-Type": "application/json" } }))
  ));
  await expect(api.get("/dashboard")).rejects.toMatchObject({ status: 401 });

  expect(warn).toHaveBeenCalledTimes(1);
  const [title, details] = warn.mock.calls[0] as [string, Record<string, unknown>];
  expect(title).toBe("[api] 401 from GET /dashboard");
  expect(details).toMatchObject({
    serverMessage: "Invalid token",
    authorizationHeaderSent: true,
    token: { present: true, looksLikeJwt: true, expired: true, role: "admin" },
  });
  expect(JSON.stringify(details)).not.toContain("sig");        // the token itself is never printed
});

test("no token at all: the diagnosis says the header was NOT sent", async () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(new Response("{}", { status: 401 }))));
  await api.get("/dashboard").catch(() => {});
  const details = warn.mock.calls[0][1] as Record<string, unknown>;
  expect(details).toMatchObject({ authorizationHeaderSent: false, token: { present: false } });
});
