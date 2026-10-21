import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { api, setUnauthorizedHandler } from "./index";

const unauthorized = () =>
  Promise.resolve(new Response(JSON.stringify({ Error: "nope" }), { status: 401, headers: { "Content-Type": "application/json" } }));

beforeEach(() => { vi.stubGlobal("fetch", vi.fn(unauthorized)); });
afterEach(() => { vi.unstubAllGlobals(); setUnauthorizedHandler(null); });

test("handleUnauthorized:false -> the 401 is a normal error (no logout)", async () => {
  const handler = vi.fn();
  setUnauthorizedHandler(handler);
  await expect(api.post("/x", {}, { handleUnauthorized: false })).rejects.toMatchObject({ status: 401, message: "nope" });
  expect(handler).not.toHaveBeenCalled();
  await expect(api.post("/x", {})).rejects.toBeTruthy();                       // default: handled
  expect(handler).toHaveBeenCalledTimes(1);
});
