import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { setUnauthorizedHandler, tokenStorage } from "../../api";
import { AdminProvider } from "../../context/AdminContext";
import Listing from "./Listing";

const item = (n: number, over: Record<string, unknown> = {}) => ({
  id: `id${n}`, code: `DEV-${1000 + n}`, title: `Villa number ${n}`, thumbnail: "",
  owner: { id: "o1", name: "Sara Ahmed", role: "agent" },
  propertyType: "villa", transaction: "rent", area: "Riverside", city: "Cairo",
  price: 75000, currency: "EGP", status: "under_review", submittedAt: "2026-10-01T10:00:00.000Z",
  ...over,
});

const json = (body: unknown, status = 200) =>
  Promise.resolve(new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } }));

let calls: string[];
let listBody: () => unknown;
let fetchMock: ReturnType<typeof vi.fn>;

const listCalls = () => calls.filter((u) => u.startsWith("/v1/admin/listings?"));
const lastList = () => new URL(listCalls().at(-1)!, "http://x").searchParams;

beforeEach(() => {
  calls = [];
  listBody = () => ({ data: [item(1), item(2)], meta: { total: 45, page: 1, limit: 10, totalPages: 5 } });
  fetchMock = vi.fn((url: string) => {
    calls.push(url);
    if (url.startsWith("/v1/admin/listings/counts"))
      return json({ all: 45, under_review: 10, change_required: 2, published: 30, rejected: 1, inactive: 2, sold_rented: 0 });
    if (url.startsWith("/v1/admin/listings/filters"))
      return json({ types: ["villa", "apartment"], transactions: ["sale", "rent"], locations: ["Riverside", "Maadi"] });
    if (url.startsWith("/v1/admin/listings?")) return json(listBody());
    return json({ Error: "not mocked" }, 404);
  });
  vi.stubGlobal("fetch", fetchMock);
  tokenStorage.clear();
  setUnauthorizedHandler(null);
});
afterEach(() => vi.unstubAllGlobals());

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <AdminProvider><MemoryRouter><Listing /></MemoryRouter></AdminProvider>
    </QueryClientProvider>
  );
}

test("first request: all params + rows mapped (type-purpose, price, status, owner, link)", async () => {
  tokenStorage.set("jwt");
  renderPage();
  expect(screen.getByRole("status")).toBeTruthy();                                // loading skeleton
  expect(await screen.findByText("Villa number 1")).toBeTruthy();

  const p = lastList();
  expect(p.get("status")).toBe("all");
  expect(p.get("sort")).toBe("-submittedAt");
  expect(p.get("page")).toBe("1");
  expect(p.get("limit")).toBe("10");
  expect(p.has("q")).toBe(false);
  const listCall = fetchMock.mock.calls.find(([u]) => String(u).includes("/listings?"))!;
  expect(listCall[1].headers.Authorization).toBe("Bearer jwt");

  const row = screen.getByText("Villa number 1").closest("tr")!;
  expect(within(row).getByText("Villa-Rent")).toBeTruthy();
  expect(within(row).getByText("Riverside, Cairo")).toBeTruthy();
  expect(within(row).getByText("75,000/Mo EGP")).toBeTruthy();
  expect(within(row).getByText("Under Review")).toBeTruthy();
  expect(within(row).getByText("Sara Ahmed")).toBeTruthy();
  expect(within(row).getByRole("link", { name: "Villa number 1" }).getAttribute("href")).toBe("/listing/id1");
});

test("tab badges come from /counts and a tab click sends status", async () => {
  renderPage();
  await screen.findByText("Villa number 1");
  await waitFor(() => expect(screen.getByRole("tab", { name: /Published/ }).textContent).toContain("30"));
  expect(screen.getByRole("tab", { name: /Inactive/ }).textContent).toContain("2");
  expect(screen.getByRole("tab", { name: /Rejected/ }).textContent).not.toMatch(/\d/);  // design: badge only on Published/Inactive
  await userEvent.click(screen.getByRole("tab", { name: /Pending Review/ }));
  await waitFor(() => expect(lastList().get("status")).toBe("under_review"));
  expect(lastList().get("page")).toBe("1");
});

test("search is debounced: one request with q, not one per key", async () => {
  renderPage();
  await screen.findByText("Villa number 1");
  const before = listCalls().length;
  await userEvent.type(screen.getByRole("textbox", { name: /Search By/ }), "nile");
  expect(listCalls().length).toBe(before);                                        // nothing yet
  await waitFor(() => expect(lastList().get("q")).toBe("nile"), { timeout: 2000 });
  expect(listCalls().length).toBe(before + 1);
});

test("dropdown filters send transaction / type / location (options come from /filters)", async () => {
  renderPage();
  await screen.findByText("Villa number 1");

  const open = async (label: string, option: string) => {
    await userEvent.click(screen.getByRole("button", { name: new RegExp(label) }));
    await userEvent.click(await screen.findByRole("option", { name: option }));
  };
  await open("Sale & Rent", "Sale");
  await waitFor(() => expect(lastList().get("transaction")).toBe("sale"));
  await open("All Types", "Apartment");
  await waitFor(() => expect(lastList().get("type")).toBe("apartment"));
  await open("All Location", "Maadi");
  await waitFor(() => expect(lastList().get("location")).toBe("Maadi"));
});

test("server pagination: page param, and a filter change resets to page 1", async () => {
  renderPage();
  await screen.findByText("Villa number 1");
  const nav = screen.getByRole("navigation", { name: "Pagination" });
  await userEvent.click(within(nav).getByRole("button", { name: "Page 3" }));
  await waitFor(() => expect(lastList().get("page")).toBe("3"));
  await userEvent.click(screen.getByRole("tab", { name: "Rejected" }));
  await waitFor(() => expect(lastList().get("status")).toBe("rejected"));
  expect(lastList().get("page")).toBe("1");
});

test("403 -> server message + Try again", async () => {
  let n = 0;
  const original = fetchMock.getMockImplementation() as (url: string) => Promise<Response>;
  fetchMock.mockImplementation((url: string) =>
    url.startsWith("/v1/admin/listings?") && n++ === 0
      ? json({ Error: "Forbidden - user does not have required Admin role" }, 403)
      : original(url)
  );
  renderPage();
  const alert = await screen.findByRole("alert");
  expect(within(alert).getByText("Forbidden - user does not have required Admin role")).toBeTruthy();
  await userEvent.click(within(alert).getByRole("button", { name: "Try again" }));
  expect(await screen.findByText("Villa number 1")).toBeTruthy();
});

test("no results -> friendly message", async () => {
  listBody = () => ({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } });
  renderPage();
  expect(await screen.findByText("No listings match your filters.")).toBeTruthy();
});

test("unknown response shape -> clear error, no crash", async () => {
  listBody = () => ({ weird: true });
  renderPage();
  expect(await screen.findByText("Unexpected response from the server.")).toBeTruthy();
});
