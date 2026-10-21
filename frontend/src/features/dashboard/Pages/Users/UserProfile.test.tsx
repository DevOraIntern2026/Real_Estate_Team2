import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { AdminProvider } from "../../context/AdminContext";
import UserProfile from "./UserProfile";

const json = (body: unknown, status = 200) =>
  Promise.resolve(new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } }));

let status: "active" | "suspended";
let calls: { url: string; method: string }[];
let suspendResponse: () => Promise<Response>;
let profileResponse: () => Promise<Response>;
let listingsResponse: () => Promise<Response>;

const listing = (n: number) => ({
  id: `l${n}`, code: `DEV-${n}`, title: `Villa ${n}`, propertyType: "villa", transaction: "rent",
  area: "Riverside", price: 16000, currency: "EGP", status: "published", submittedAt: "2026-10-01T10:00:00.000Z",
});

beforeEach(() => {
  status = "active";
  calls = [];
  profileResponse = () => json({
    user: { id: "u1", name: "Sara Ahmed", email: "sara@mail.com", phone: "+20123456789", location: "New Cairo", role: "owner", status, createdAt: "2026-09-20T10:00:00.000Z" },
    listingsSummary: { total: 9, published: 2, pending: 1, rejected: 1, rent: 2, sale: 3 },
  });
  listingsResponse = () => json({ data: [listing(1), listing(2)], meta: { total: 2, page: 1, limit: 10, totalPages: 1 } });
  suspendResponse = () => { status = "suspended"; return json({ ok: true }); };
  vi.stubGlobal("fetch", vi.fn((url: string, init: RequestInit) => {
    calls.push({ url, method: init.method ?? "GET" });
    if (url === "/v1/admin/users/u1") return profileResponse();
    if (url.startsWith("/v1/admin/users/u1/listings")) return listingsResponse();
    if (url === "/v1/admin/users/u1/suspend") return suspendResponse();
    if (url === "/v1/admin/users/u1/activate") { status = "active"; return json({ ok: true }); }
    return json({ Error: "Not found" }, 404);
  }));
});
afterEach(() => vi.unstubAllGlobals());

function renderPage(id = "u1") {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <AdminProvider>
        <MemoryRouter initialEntries={[`/users/${id}`]}>
          <Routes>
            <Route path="users/:userId" element={<UserProfile />} />
            <Route path="listing/:listingId" element={<div>DETAILS PAGE</div>} />
          </Routes>
        </MemoryRouter>
      </AdminProvider>
    </QueryClientProvider>
  );
}

test("shows the profile, the summary numbers and the listings from the API", async () => {
  renderPage();
  expect(screen.getByRole("status")).toBeTruthy();
  expect(await screen.findByText("sara@mail.com · Owner")).toBeTruthy();
  expect(screen.getByText("New Cairo")).toBeTruthy();
  expect(screen.getByText("Sep 20, 2026")).toBeTruthy();

  const summary = within(screen.getByText("Listings Summary").closest("section")!);
  const val = (label: string) => summary.getByText(label).parentElement!.textContent;
  expect(val("Total Listing")).toContain("9");
  expect(val("Sale")).toContain("3");
  expect(val("Rejected")).toContain("1");

  expect(await screen.findByText("Villa 1")).toBeTruthy();
  // the API sent no owner on these rows -> the profile's name fills the Owner column
  expect(within(screen.getByText("Villa 1").closest("tr")!).getByText("Sara Ahmed")).toBeTruthy();
  expect(calls.some((c) => c.url === "/v1/admin/users/u1/listings?page=1&limit=10")).toBe(true);
});

test("suspend: POST, then the page refreshes by itself and offers Activate", async () => {
  renderPage();
  await screen.findByText("sara@mail.com · Owner");
  await userEvent.click(screen.getByRole("button", { name: "Suspend User" }));
  const d = within(screen.getByRole("dialog", { name: "Suspend this user?", hidden: true }));
  await userEvent.click(d.getByRole("button", { name: "Suspend" }));

  await waitFor(() => expect(calls.some((c) => c.url === "/v1/admin/users/u1/suspend" && c.method === "POST")).toBe(true));
  expect(await screen.findByRole("button", { name: "Activate User" })).toBeTruthy();   // refetched status
  expect(screen.getByText("Suspended")).toBeTruthy();
});

test("suspend fails -> the server's message shows INSIDE the dialog and it stays open", async () => {
  suspendResponse = () => json({ Error: "Suspension reason is required" }, 400);
  renderPage();
  await screen.findByText("sara@mail.com · Owner");
  await userEvent.click(screen.getByRole("button", { name: "Suspend User" }));
  const d = within(screen.getByRole("dialog", { name: "Suspend this user?", hidden: true }));
  await userEvent.click(d.getByRole("button", { name: "Suspend" }));
  expect((await d.findByRole("alert")).textContent).toBe("Suspension reason is required");
  expect(screen.getByRole("button", { name: "Suspend User" })).toBeTruthy();            // still active
});

test("activate a suspended user", async () => {
  status = "suspended";
  renderPage();
  await userEvent.click(await screen.findByRole("button", { name: "Activate User" }));
  await userEvent.click(within(screen.getByRole("dialog", { name: "Activate this user?", hidden: true })).getByRole("button", { name: "Activate" }));
  expect(await screen.findByRole("button", { name: "Suspend User" })).toBeTruthy();
  expect(calls.some((c) => c.url.endsWith("/activate") && c.method === "POST")).toBe(true);
});

test("404 -> 'User not found.'; other errors -> retry panel", async () => {
  profileResponse = () => json({ Error: "User not found" }, 404);
  const { unmount } = renderPage();
  expect(await screen.findByText(/User not found\./)).toBeTruthy();
  unmount();

  profileResponse = () => json({ Error: "Server exploded" }, 500);
  renderPage();
  expect(await screen.findByText("Server exploded")).toBeTruthy();
  expect(screen.getByRole("button", { name: "Try again" })).toBeTruthy();
});

test("the listings can fail without hiding the profile", async () => {
  listingsResponse = () => json({ Error: "Listings unavailable" }, 500);
  renderPage();
  expect(await screen.findByText("sara@mail.com · Owner")).toBeTruthy();
  expect(await screen.findByText("Listings unavailable")).toBeTruthy();
});

test("clicking a listing row opens its details page", async () => {
  renderPage();
  await userEvent.click(within((await screen.findByText("Villa 2")).closest("tr")!).getByText("Riverside"));
  expect(await screen.findByText("DETAILS PAGE")).toBeTruthy();
});

test("unrecognized profile shape -> clear error, no crash", async () => {
  profileResponse = () => json({ something: "else" });
  renderPage();
  expect(await screen.findByText("Unexpected response from the server.")).toBeTruthy();
});
