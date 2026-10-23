import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { tokenStorage } from "../../../api";
import { MockSessionProvider } from "../../../context/MockSessionProvider";
import { ownerMock } from "../../../data/owner.mock";
import OwnerOverview from "./OwnerOverview";
import { normalizeOwnerDashboard } from "./mappers";

const json = (body: unknown, status = 200) =>
  Promise.resolve(new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } }));

const property = (n: number, over: Record<string, unknown> = {}) => ({
  id: `p${n}`, code: `DEV-${n}`, title: `Villa ${n}`, propertyType: "villa", transaction: "rent",
  area: "Riverside", city: "Cairo", price: 75000, currency: "EGP", status: "under_review",
  updatedAt: "2026-09-21T10:00:00.000Z", ...over,
});
const inquiry = (n: number, over: Record<string, unknown> = {}) => ({
  id: `i${n}`, property: { id: `p${n}`, title: `Villa ${n}`, code: `DEV-${n}`, propertyType: "office", transaction: "sale" },
  customer: { name: `Customer ${n}`, phone: "+201234567890" }, message: "Is the place still available for rent?",
  status: "new", createdAt: "2026-09-20T10:00:00.000Z", ...over,
});
const notification = (n: number, over: Record<string, unknown> = {}) => ({
  id: `n${n}`, type: "listing_approved", title: `Your property #${n} has been approved.`, body: "It is now live.",
  isRead: false, createdAt: "2026-09-19T10:00:00.000Z", ...over,
});

let body: () => Promise<Response>;
let calls: { url: string; auth?: string }[];

beforeEach(() => {
  calls = [];
  body = () => json({
    summary: { totalProperties: 12, published: 7, underReview: 3, newInquiries30d: 5, unreadNotifications: 2 },
    recentProperties: [property(1), property(2, { status: "published", transaction: "sale" })],
    recentInquiries: [inquiry(1), inquiry(2, { status: "responded" })],
    recentNotifications: [notification(1), notification(2, { type: "listing_rejected", isRead: true })],
  });
  vi.stubGlobal("fetch", vi.fn((url: string, init: RequestInit = {}) => {
    calls.push({ url, auth: (init.headers as Record<string, string>)?.Authorization });
    return body();
  }));
  localStorage.setItem("ACCESS_TOKEN", "owner-jwt");
});
afterEach(() => { vi.unstubAllGlobals(); localStorage.clear(); });

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MockSessionProvider initialAdmin={ownerMock}>
        <MemoryRouter initialEntries={["/owner"]}>
          <Routes>
            <Route path="owner" element={<OwnerOverview />} />
            <Route path="owner/inquiries/:inquiryId" element={<div>REPLY PAGE</div>} />
          </Routes>
        </MemoryRouter>
      </MockSessionProvider>
    </QueryClientProvider>
  );
}

test("ONE request to /dashboard (no /v1) with the ACCESS_TOKEN as Bearer", async () => {
  renderPage();
  expect(screen.getByRole("status")).toBeTruthy();
  await screen.findByText("Total Property");
  expect(calls).toHaveLength(1);                                         // unified: not 4 requests
  expect(calls[0].url).toBe("/dashboard");
  expect(calls[0].auth).toBe("Bearer owner-jwt");
});

test("stats come from summary", async () => {
  renderPage();
  await screen.findByText("Total Property");
  const card = (label: string) =>
    screen.getAllByText(label).find((el) => el.tagName === "P" && el.nextElementSibling)!.closest("div")!;
  expect(within(card("Total Property")).getByText("12")).toBeTruthy();
  expect(within(card("Published")).getByText("7")).toBeTruthy();
  expect(within(card("Under Review")).getByText("3")).toBeTruthy();
  expect(within(card("New Inquiries (30d)")).getByText("5")).toBeTruthy();
});

test("recent properties are mapped (labels, price, status)", async () => {
  renderPage();
  await screen.findByText("Recent Properties");
  const propertiesTable = within(screen.getAllByRole("table")[0]);   // 1st table = properties, 2nd = inquiries
  const row = propertiesTable.getByText("Villa 1").closest("tr")!;
  expect(within(row).getByText("DEV-1")).toBeTruthy();
  expect(within(row).getByText("Rent")).toBeTruthy();
  expect(within(row).getByText("Villa")).toBeTruthy();
  expect(within(row).getByText("Riverside, Cairo")).toBeTruthy();
  expect(within(row).getByText("75,000/Mo EGP")).toBeTruthy();
  expect(within(row).getByText("Under Review")).toBeTruthy();
  const row2 = propertiesTable.getByText("Villa 2").closest("tr")!;
  expect(within(row2).getByText("Published")).toBeTruthy();
  expect(within(row2).getByText("75,000 EGP")).toBeTruthy();             // sale: no /Mo
});

test("recent inquiries (nested customer/property fields) + click opens the reply page", async () => {
  renderPage();
  const row = (await screen.findByText("Customer 1")).closest("tr")!;
  expect(within(row).getByText("Office-Sale")).toBeTruthy();
  expect(within(row).getByText("New")).toBeTruthy();
  expect(within(screen.getByText("Customer 2").closest("tr")!).getByText("Responded")).toBeTruthy();
  await userEvent.click(within(row).getByText("+201234567890"));
  expect(await screen.findByText("REPLY PAGE")).toBeTruthy();
});

test("recent notifications: titles + unread marker", async () => {
  renderPage();
  expect(await screen.findByText(/Your property #1 has been approved\./)).toBeTruthy();
  expect(screen.getAllByText("Unread:").length).toBe(1);                 // the second one is read
});

test("never shows more than 3 of each, even if the API sends more", async () => {
  body = () => json({
    summary: {}, recentProperties: [1, 2, 3, 4, 5].map((n) => property(n)),
    recentInquiries: [], recentNotifications: [],
  });
  renderPage();
  await screen.findByText("Villa 1");
  expect(screen.queryByText("Villa 4")).toBeNull();
  expect(screen.getByText("You have no inquiries yet.")).toBeTruthy();
  expect(screen.getByText("You have no notifications yet.")).toBeTruthy();
});

test("missing lists don't crash the page", async () => {
  body = () => json({ summary: { totalProperties: 1 } });
  renderPage();
  expect(await screen.findByText("You have no properties yet.")).toBeTruthy();
});

test("401 Invalid token -> session message + Go to login (and the login keys are cleared)", async () => {
  localStorage.setItem("REFRESH_TOKEN", "r");
  body = () => json({ Error: "Invalid token" }, 401);
  const assign = vi.fn();
  const original = window.location;
  Object.defineProperty(window, "location", { value: { ...original, assign }, writable: true });
  renderPage();
  const alert = await screen.findByRole("alert");
  expect(within(alert).getByText("Your session is invalid or has expired. Please log in again.")).toBeTruthy();
  await userEvent.click(within(alert).getByRole("button", { name: "Go to login" }));
  expect(assign).toHaveBeenCalledWith("/login");
  expect(tokenStorage.get()).toBeNull();
  expect(localStorage.getItem("REFRESH_TOKEN")).toBeNull();
  Object.defineProperty(window, "location", { value: original, writable: true });
});

test("403 shows the server's message with Try again (which recovers)", async () => {
  let n = 0;
  const ok = body;
  body = () => (n++ === 0 ? json({ Error: "Forbidden - owner role required" }, 403) : ok());
  renderPage();
  const alert = await screen.findByRole("alert");
  expect(within(alert).getByText("Forbidden - owner role required")).toBeTruthy();
  await userEvent.click(within(alert).getByRole("button", { name: "Try again" }));
  expect(await screen.findByText("Total Property")).toBeTruthy();
});

test("unknown shape -> clear error; mapper survives flat / alternative field names", async () => {
  body = () => json({ nope: true });
  renderPage();
  expect(await screen.findByText("Unexpected response from the server.")).toBeTruthy();

  const vm = normalizeOwnerDashboard({
    data: {
      summary: { totalProperties: "4", clients: 9, closedDeals: 2 },
      recentInquiries: { items: [{ _id: "x", propertyTitle: "Loft", customerName: "Mai", customerPhone: "+20111", message: "hi", status: "RESPONDED", createdAt: "2026-01-01" }] },
    },
  });
  expect(vm.stats).toMatchObject({ totalProperties: 4, clients: 9, closedDeals: 2, published: 0 });
  expect(vm.inquiries[0]).toMatchObject({ id: "x", propertyTitle: "Loft", customerName: "Mai", phone: "+20111", statusLabel: "Responded" });
});
