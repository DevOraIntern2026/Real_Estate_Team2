import { expect, test } from "vitest";
import { ApiError } from "./ApiError";
import { shouldRetry } from "./queryClient";

test("shouldRetry: never for 4xx, twice for network/5xx", () => {
  expect(shouldRetry(0, new ApiError(401, "x"))).toBe(false);
  expect(shouldRetry(0, new ApiError(403, "x"))).toBe(false);
  expect(shouldRetry(0, new ApiError(404, "x"))).toBe(false);
  expect(shouldRetry(0, new ApiError(0, "net"))).toBe(true);
  expect(shouldRetry(1, new ApiError(500, "x"))).toBe(true);
  expect(shouldRetry(2, new ApiError(500, "x"))).toBe(false);
});
