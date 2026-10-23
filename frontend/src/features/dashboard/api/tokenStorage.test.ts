import { afterEach, expect, test } from "vitest";
import { tokenStorage } from "./tokenStorage";

afterEach(() => { localStorage.clear(); sessionStorage.clear(); });

test("reads ACCESS_TOKEN from sessionStorage first, then localStorage", () => {
  expect(tokenStorage.get()).toBeNull();
  localStorage.setItem("ACCESS_TOKEN", "from-local");
  expect(tokenStorage.get()).toBe("from-local");
  sessionStorage.setItem("ACCESS_TOKEN", "from-session");
  expect(tokenStorage.get()).toBe("from-session");           // session wins
});

test("set() saves in sessionStorage (not localStorage)", () => {
  tokenStorage.set("abc");
  expect(sessionStorage.getItem("ACCESS_TOKEN")).toBe("abc");
  expect(localStorage.getItem("ACCESS_TOKEN")).toBeNull();
});

test("a JSON-stringified token (with quotes) is cleaned", () => {
  sessionStorage.setItem("ACCESS_TOKEN", JSON.stringify("eyJhbGciOi.payload.sig"));
  expect(tokenStorage.get()).toBe("eyJhbGciOi.payload.sig");
});

test("fallback: no ACCESS_TOKEN but AUTH_SESSION is JSON with accessToken / access_token / token", () => {
  sessionStorage.setItem("AUTH_SESSION", JSON.stringify({ accessToken: "t1", user: { id: 1 } }));
  expect(tokenStorage.get()).toBe("t1");
  sessionStorage.setItem("AUTH_SESSION", JSON.stringify({ access_token: "t2" }));
  expect(tokenStorage.get()).toBe("t2");
  sessionStorage.setItem("AUTH_SESSION", JSON.stringify({ token: "t3" }));
  expect(tokenStorage.get()).toBe("t3");
  sessionStorage.setItem("AUTH_SESSION", "not json");
  expect(tokenStorage.get()).toBeNull();
  sessionStorage.setItem("AUTH_SESSION", JSON.stringify({ user: 1 }));
  expect(tokenStorage.get()).toBeNull();
});

test("ACCESS_TOKEN wins over AUTH_SESSION; REFRESH_TOKEN and the old devora_token are never used", () => {
  sessionStorage.setItem("ACCESS_TOKEN", "access");
  sessionStorage.setItem("AUTH_SESSION", JSON.stringify({ accessToken: "other" }));
  expect(tokenStorage.get()).toBe("access");
  sessionStorage.clear();
  sessionStorage.setItem("REFRESH_TOKEN", "refresh");
  localStorage.setItem("devora_token", "old");
  expect(tokenStorage.get()).toBeNull();
});

test("clear() removes the 3 keys from both storages", () => {
  for (const k of ["ACCESS_TOKEN", "REFRESH_TOKEN", "AUTH_SESSION"]) { localStorage.setItem(k, "x"); sessionStorage.setItem(k, "x"); }
  tokenStorage.clear();
  for (const k of ["ACCESS_TOKEN", "REFRESH_TOKEN", "AUTH_SESSION"]) {
    expect(localStorage.getItem(k)).toBeNull();
    expect(sessionStorage.getItem(k)).toBeNull();
  }
});
