import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { api, ApiError, getErrorMessage, setUnauthorizedHandler, tokenStorage } from "./index";

const json = (body: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(body), { headers: { "Content-Type": "application/json" }, ...init });

const fail = async (p: Promise<unknown>): Promise<ApiError> => {
  try {
    await p;
  } catch (e) {
    return e as ApiError;
  }
  throw new Error("expected the request to fail");
};

let fetchMock: ReturnType<typeof vi.fn>;
beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
  tokenStorage.clear();
  setUnauthorizedHandler(null);
});
afterEach(() => vi.unstubAllGlobals());

test("GET: builds the query string (skips empty values) and sends the Bearer token", async () => {
  tokenStorage.set("abc123");
  fetchMock.mockResolvedValue(json({ ok: true }));
  const res = await api.get<{ ok: boolean }>("/users", { page: 2, role: "Owner", search: "", status: undefined });
  expect(res.ok).toBe(true);
  const [url, init] = fetchMock.mock.calls[0];
  expect(url).toBe("/users?page=2&role=Owner");
  expect(init.headers.Authorization).toBe("Bearer abc123");
  expect(init.method).toBe("GET");
});

test("POST: object body -> JSON + content-type; FormData is passed untouched", async () => {
  fetchMock.mockImplementation(() => Promise.resolve(json({ id: 1 })));
  await api.post("/x", { a: 1 });
  expect(fetchMock.mock.calls[0][1].body).toBe('{"a":1}');
  expect(fetchMock.mock.calls[0][1].headers["Content-Type"]).toBe("application/json");

  const fd = new FormData();
  fd.append("file", new Blob(["x"]), "a.png");
  await api.post("/upload", fd);
  expect(fetchMock.mock.calls[1][1].body).toBe(fd);
  expect(fetchMock.mock.calls[1][1].headers["Content-Type"]).toBeUndefined();
});

test("error response -> ApiError with the server's message + status + raw details", async () => {
  fetchMock.mockResolvedValue(json({ message: "Email already used", errors: { email: "taken" } }, { status: 409 }));
  const err = await fail(api.post("/users", {}));
  expect(err).toBeInstanceOf(ApiError);
  expect(err.status).toBe(409);
  expect(err.message).toBe("Email already used");
  expect((err.details as { errors: { email: string } }).errors.email).toBe("taken");
});

test("other message field names are understood (error / detail)", async () => {
  fetchMock.mockResolvedValue(json({ error: "Bad input" }, { status: 400 }));
  expect((await fail(api.get("/a"))).message).toBe("Bad input");
});

test("401 with auth calls the unauthorized handler once; login (auth:false) does not", async () => {
  const handler = vi.fn();
  setUnauthorizedHandler(handler);
  fetchMock.mockResolvedValue(json({ message: "Expired" }, { status: 401 }));
  await api.get("/me").catch(() => {});
  expect(handler).toHaveBeenCalledTimes(1);

  await api.post("/login", { email: "x" }, { auth: false }).catch(() => {});
  expect(handler).toHaveBeenCalledTimes(1); // wrong password is NOT "session expired"
});

test("login (auth:false) never sends the token", async () => {
  tokenStorage.set("old");
  fetchMock.mockResolvedValue(json({ token: "new" }));
  await api.post("/login", {}, { auth: false });
  expect(fetchMock.mock.calls[0][1].headers.Authorization).toBeUndefined();
});

test("204 / empty body -> undefined", async () => {
  fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
  expect(await api.delete("/users/1")).toBeUndefined();
});

test("network failure -> ApiError(0) with a friendly message", async () => {
  fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
  const err = await fail(api.get("/a"));
  expect(err).toBeInstanceOf(ApiError);
  expect(err.status).toBe(0);
  expect(getErrorMessage(err)).toMatch(/Network error/);
});

test("getErrorMessage falls back for unknown throws", () => {
  expect(getErrorMessage("boom")).toBe("Something went wrong.");
  expect(getErrorMessage(null, "Nope")).toBe("Nope");
});

test("your backend's { Error: ... } (capital E) is understood", async () => {
  fetchMock.mockImplementation(() =>
    Promise.resolve(json({ Error: "Unauthorized - missing or invalid JWT bearer token" }, { status: 401 }))
  );
  const err = await fail(api.get("/v1/admin/overview"));
  expect(err.status).toBe(401);
  expect(err.message).toBe("Unauthorized - missing or invalid JWT bearer token");
});
