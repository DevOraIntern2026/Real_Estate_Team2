import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { tokenStorage } from "../../../../api";
import { AdminProvider } from "../../context/AdminContext";
import Users from "./Users";

const user = (n: number, over: Record<string, unknown> = {}) => ({
  id: `u${n}`, name: `User ${n}`, email: `user${n}@mail.com`, phone: "+20123456789",
  role: "owner", status: "active", listingsCount: n, createdAt: "2026-09-24T10:00:00.000Z", ...over,
});
const json = (body: unknown, status = 200) =>
  Promise.resolve(new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } }));

let calls: string[];
let listBody: () => unknown;
const last = () => new URL(calls.filter((u) => u.startsWith("/v1/admin/users?")).at(-1)!, "http://x").searchParams;

beforeEach(() => {
  calls = [];
  listBody = () => ({ data: [user(1), user(2, { status: "suspended", role: "agent" })], meta: { total: 25, page: 1, limit: 10, totalPages: 3 } });
  vi.stubGlobal("fetch", vi.fn((url: string) => { calls.push(url); return json(listBody()); }));
  tokenStorage.clear();
});
afterEach(() => vi.unstubAllGlobals());

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <AdminProvider>
        <MemoryRouter initialEntries={["/users"]}>
          <Routes>
            <Route path="users" element={<Users />} />
            <Route path="users/:userId" element={<div>PROFILE PAGE</div>} />
          </Routes>
        </MemoryRouter>
      </AdminProvider>
    </QueryClientProvider>
  );
}

test("first request has only page+limit; rows are mapped", async () => {
  renderPage();
  expect(screen.getByRole("status")).toBeTruthy();
  await screen.findByText("User 1");
  expect(calls[0]).toBe("/v1/admin/users?page=1&limit=10");

  const row = screen.getByText("User 1").closest("tr")!;
  expect(within(row).getByText("Owner")).toBeTruthy();
  expect(within(row).getByText("user1@mail.com")).toBeTruthy();
  expect(within(row).getByText("1")).toBeTruthy();                       // listingsCount
  expect(within(row).getByText("Active")).toBeTruthy();
  expect(within(row).getByText("Sep 24, 2026")).toBeTruthy();
  const row2 = screen.getByText("User 2").closest("tr")!;
  expect(within(row2).getByText("Suspended")).toBeTruthy();
  expect(within(row2).getByText("Agent")).toBeTruthy();
});

test("role/status are sent LOWERCASE; filters reset the page", async () => {
  renderPage();
  await screen.findByText("User 1");
  await userEvent.click(within(screen.getByRole("navigation", { name: "Pagination" })).getByRole("button", { name: "Page 2" }));
  await waitFor(() => expect(last().get("page")).toBe("2"));

  await userEvent.click(screen.getByRole("button", { name: /All Roles/ }));
  await userEvent.click(await screen.findByRole("option", { name: "Owner" }));
  await waitFor(() => expect(last().get("role")).toBe("owner"));
  expect(last().get("page")).toBe("1");

  await userEvent.click(screen.getByRole("button", { name: /All Statuses/ }));
  await userEvent.click(await screen.findByRole("option", { name: "Suspended" }));
  await waitFor(() => expect(last().get("status")).toBe("suspended"));
});

test("search is debounced and sends q; '25 Results Matched' label", async () => {
  renderPage();
  await screen.findByText("User 1");
  const before = calls.length;
  await userEvent.type(screen.getByRole("textbox", { name: "Search By Name Or Email" }), "sara");
  expect(calls.length).toBe(before);
  await waitFor(() => expect(last().get("q")).toBe("sara"), { timeout: 2000 });
  expect(calls.length).toBe(before + 1);
  expect(await screen.findByText("25 Results Matched")).toBeTruthy();
});

test("click a row and the name link both open the profile", async () => {
  renderPage();
  await screen.findByText("User 1");
  await userEvent.click(within(screen.getByText("User 2").closest("tr")!).getByText("user2@mail.com"));
  expect(await screen.findByText("PROFILE PAGE")).toBeTruthy();
});

test("no users at all -> empty screen, toolbar hidden", async () => {
  listBody = () => ({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } });
  renderPage();
  expect(await screen.findByText("The users list is empty, there are no users to show yet.")).toBeTruthy();
  expect(screen.queryByRole("textbox")).toBeNull();
});

test("filters hide everyone -> 'No Things Matched' (no '0 Results Matched')", async () => {
  renderPage();
  await screen.findByText("User 1");
  listBody = () => ({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } });
  await userEvent.type(screen.getByRole("textbox"), "zzz");
  expect(await screen.findByText("No Things Matched To Your Search", {}, { timeout: 2000 })).toBeTruthy();
  expect(screen.queryByText(/Matched$/)).toBeNull();
  expect(screen.getAllByRole("columnheader").length).toBe(7);
});

test("403 -> server message + Try again", async () => {
  let n = 0;
  const original = listBody;
  vi.stubGlobal("fetch", vi.fn((url: string) => { calls.push(url); return n++ === 0 ? json({ Error: "Forbidden - user does not have required Admin role" }, 403) : json(original()); }));
  renderPage();
  const alert = await screen.findByRole("alert");
  expect(within(alert).getByText("Forbidden - user does not have required Admin role")).toBeTruthy();
  await userEvent.click(within(alert).getByRole("button", { name: "Try again" }));
  expect(await screen.findByText("User 1")).toBeTruthy();
});
