import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { setUnauthorizedHandler, tokenStorage } from "../../../../api";
import { MockSessionProvider as AdminProvider } from "../../context/MockSessionProvider";
import AdminOverview from "./AdminOverview";
import { notificationKind, prettify, toPropertyStatus } from "./mappers";

// the example straight from the Swagger page
const payload = () => ({
  stats: { totalUsers: 120, totalListings: 45, newUsers30d: 18, published: 30 },
  pendingListings: [
    {
      id: "abc123", code: "DEV-1042", title: "Modern Luxury Villa", thumbnail: "",
      owner: { id: "o1", name: "Sara Ahmed", role: "agent" },
      propertyType: "villa", transaction: "rent", area: "Riverside", price: 75000, currency: "EGP",
      status: "under_review", submittedAt: "2026-10-14T19:38:23.660Z",
    },
  ],
  recentNotifications: [
    { id: "n1", type: "listing_submitted", title: "New listing submitted", body: "Modern Luxury Villa is waiting", isRead: false, createdAt: "2026-10-14T19:38:23.660Z" },
  ],
  unreadNotifications: 3,
});
const ok = (body: unknown) => Promise.resolve(new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": "application/json" } }));
const fail = (status: number, body: unknown) => Promise.resolve(new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } }));

let fetchMock: ReturnType<typeof vi.fn>;
beforeEach(() => { fetchMock = vi.fn(); vi.stubGlobal("fetch", fetchMock); tokenStorage.clear(); setUnauthorizedHandler(null); });
afterEach(() => vi.unstubAllGlobals());

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <AdminProvider>
        <MemoryRouter><AdminOverview /></MemoryRouter>
      </AdminProvider>
    </QueryClientProvider>
  );
}

test("sends the right request: path, limits as query, Bearer token", async () => {
  tokenStorage.set("jwt-token");
  fetchMock.mockImplementation(() => ok(payload()));
  renderPage();
  await screen.findByText("Total User");
  const [url, init] = fetchMock.mock.calls[0];
  expect(url).toBe("/v1/admin/overview?pendingLimit=5&notificationsLimit=3");
  expect(init.headers.Authorization).toBe("Bearer jwt-token");
});

test("shows a loading state first, then the mapped data", async () => {
  fetchMock.mockImplementation(() => ok(payload()));
  renderPage();
  expect(screen.getByRole("status")).toBeTruthy();                 // skeleton
  await screen.findByText("Total User");

  const card = (label: string) => screen.getByText(label).closest("div")!;
  expect(within(card("Total User")).getByText("120")).toBeTruthy();
  expect(within(card("Total Listing")).getByText("45")).toBeTruthy();
  expect(within(card("New Users (30d)")).getByText("18")).toBeTruthy();
  expect(within(card("Published")).getByText("30")).toBeTruthy();

  expect(screen.getByText("Modern Luxury Villa")).toBeTruthy();
  expect(screen.getByText(/Sara Ahmed\. Villa\. Rent\. Riverside\. 75,000 EGP/)).toBeTruthy();
  expect(screen.getByText("Under Review")).toBeTruthy();
  expect(screen.getByText(/DEV-1042 · Submitted/)).toBeTruthy();
  expect(screen.getByRole("link", { name: "Review" }).getAttribute("href")).toBe("/listing/abc123");
  expect(screen.getByText("New listing submitted")).toBeTruthy();
  expect(screen.getByText("Unread:")).toBeTruthy();
});

test("empty lists show friendly messages", async () => {
  fetchMock.mockImplementation(() => ok({ ...payload(), pendingListings: [], recentNotifications: [] }));
  renderPage();
  expect(await screen.findByText("No listings are waiting for review.")).toBeTruthy();
  expect(screen.getByText("No recent notifications.")).toBeTruthy();
});

test("server leaves the lists out -> page still renders", async () => {
  fetchMock.mockImplementation(() => ok({ stats: payload().stats }));
  renderPage();
  expect(await screen.findByText("No listings are waiting for review.")).toBeTruthy();
});

test("403 shows the server's { Error } message, Try again refetches and recovers", async () => {
  fetchMock
    .mockImplementationOnce(() => fail(403, { Error: "Forbidden - user does not have required Admin role" }))
    .mockImplementation(() => ok(payload()));
  renderPage();
  const alert = await screen.findByRole("alert");
  expect(within(alert).getByText("Forbidden - user does not have required Admin role")).toBeTruthy();
  await userEvent.click(within(alert).getByRole("button", { name: "Try again" }));
  expect(await screen.findByText("Total User")).toBeTruthy();
  expect(fetchMock).toHaveBeenCalledTimes(2);
});

test("401 triggers the global unauthorized handler", async () => {
  const handler = vi.fn();
  setUnauthorizedHandler(handler);
  fetchMock.mockImplementation(() => fail(401, { Error: "Unauthorized - missing or invalid JWT bearer token" }));
  renderPage();
  expect(await screen.findByRole("alert")).toBeTruthy();
  expect(handler).toHaveBeenCalledTimes(1);
});

test("network failure -> readable message", async () => {
  fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
  renderPage();
  expect(await screen.findByText(/Network error/)).toBeTruthy();
});

test("mappers", () => {
  expect(prettify("under_review")).toBe("Under Review");
  expect(prettify("villa")).toBe("Villa");
  expect(toPropertyStatus("under_review")).toBe("Under Review");
  expect(toPropertyStatus("something_new")).toBeUndefined();
  expect(notificationKind("listing_submitted")).toBe("info");
  expect(notificationKind("listing_rejected")).toBe("danger");
  expect(notificationKind("listing_approved")).toBe("success");
});
