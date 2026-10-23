import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { MockSessionProvider } from "../../../context/MockSessionProvider";
import { ownerMock } from "../../../data/owner.mock";
import MyProperties from "./MyProperties";

const property = (n: number, over: Record<string, unknown> = {}) => ({
  id: `p${n}`, code: `DEV-${n}`, title: `Property ${n}`, propertyType: "house", transaction: "rent",
  area: "Maadi", city: "Cairo", price: 16000, currency: "EGP", status: "published",
  submittedAt: "2026-09-24T10:00:00.000Z", ...over,
});
const json = (body: unknown, status = 200) =>
  Promise.resolve(new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } }));

let calls: { url: string; auth?: string }[];
let pages: (page: number) => Promise<Response>;

beforeEach(() => {
  calls = [];
  const data = [
    property(1, { status: "under_review" }),
    property(2, { propertyType: "office", transaction: "sale", area: "Garden City", price: 16000, status: "published" }),
    property(3, { status: "rejected" }),
    property(4, { status: "draft", submittedAt: undefined, updatedAt: "2026-09-25T10:00:00.000Z" }),
    property(5, { status: "submitted", area: "Giza", city: undefined }),
  ];
  pages = () => json({ data, meta: { total: 5, page: 1, limit: 50, totalPages: 1 } });
  vi.stubGlobal("fetch", vi.fn((url: string, init: RequestInit = {}) => {
    calls.push({ url, auth: (init.headers as Record<string, string>)?.Authorization });
    return pages(Number(new URL(url, "http://x").searchParams.get("page")));
  }));
  localStorage.setItem("ACCESS_TOKEN", "owner-jwt");
});
afterEach(() => { vi.unstubAllGlobals(); localStorage.clear(); });

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MockSessionProvider initialAdmin={ownerMock}>
        <MemoryRouter initialEntries={["/owner/properties"]}>
          <Routes>
            <Route path="owner/properties" element={<MyProperties />} />
            <Route path="owner/properties/:propertyId" element={<div>DETAILS PAGE</div>} />
            <Route path="owner/properties/:propertyId/edit" element={<div>EDIT PAGE</div>} />
            <Route path="owner/add-property" element={<div>ADD PAGE</div>} />
          </Routes>
        </MemoryRouter>
      </MockSessionProvider>
    </QueryClientProvider>
  );
}
const rowOf = (title: string) => screen.getByText(title).closest("tr")!;

test("one request GET /properties/my (page 1, limit 50) with the Bearer token; rows mapped", async () => {
  renderPage();
  expect(screen.getByRole("status")).toBeTruthy();
  await screen.findByText("Property 1");
  expect(calls).toHaveLength(1);
  expect(calls[0].url).toBe("/properties/my?page=1&limit=50");
  expect(calls[0].auth).toBe("Bearer owner-jwt");

  const r1 = rowOf("Property 1");
  expect(within(r1).getByText("House-Rent")).toBeTruthy();
  expect(within(r1).getByText("Maadi, Cairo")).toBeTruthy();
  expect(within(r1).getByText("16,000/Mo EGP")).toBeTruthy();
  expect(within(r1).getByText("Under Review")).toBeTruthy();
  expect(within(rowOf("Property 2")).getByText("Office-Sale")).toBeTruthy();
  expect(within(rowOf("Property 2")).getByText("16,000 EGP")).toBeTruthy();
  expect(within(rowOf("Property 3")).getByText("Rejected")).toBeTruthy();
});

test("a draft shows 'Continue Edit' (not a date) and it opens the edit page, not the details", async () => {
  renderPage();
  await screen.findByText("Property 4");
  const draft = rowOf("Property 4");
  expect(within(draft).getByText("Draft")).toBeTruthy();
  await userEvent.click(within(draft).getByRole("link", { name: "Continue Edit" }));
  expect(await screen.findByText("EDIT PAGE")).toBeTruthy();
});

test("loads every page when there is more than one", async () => {
  pages = (page) =>
    json({ data: [property(page * 10)], meta: { total: 3, page, limit: 50, totalPages: 3 } });
  renderPage();
  await screen.findByText("Property 30");
  expect(calls.map((c) => c.url)).toEqual([
    "/properties/my?page=1&limit=50", "/properties/my?page=2&limit=50", "/properties/my?page=3&limit=50",
  ]);
  expect(screen.getByText("Property 10")).toBeTruthy();
  expect(screen.getByText("Property 20")).toBeTruthy();
});

test("tabs group statuses: Under Review = under_review + submitted; Draft; Published; Rejected", async () => {
  renderPage();
  await screen.findByText("Property 1");
  await userEvent.click(screen.getByRole("tab", { name: "Under Review" }));
  expect(screen.getByText("Property 1")).toBeTruthy();
  expect(screen.getByText("Property 5")).toBeTruthy();              // "submitted"
  expect(screen.queryByText("Property 2")).toBeNull();
  expect(screen.getByText("2 Results Matched")).toBeTruthy();
  await userEvent.click(screen.getByRole("tab", { name: "Draft" }));
  expect(screen.getByText("Property 4")).toBeTruthy();
  expect(screen.getByText("1 Result Matched")).toBeTruthy();
});

test("search + sale/rent + type + location filter on the client; no extra requests", async () => {
  renderPage();
  await screen.findByText("Property 1");
  await userEvent.type(screen.getByRole("textbox", { name: "Search Your Properties" }), "garden");
  expect(screen.getByText("1 Result Matched")).toBeTruthy();
  expect(screen.getByText("Property 2")).toBeTruthy();
  expect(screen.queryByText("Property 1")).toBeNull();
  await userEvent.clear(screen.getByRole("textbox", { name: "Search Your Properties" }));

  await userEvent.click(screen.getByRole("button", { name: /Sale & Rent/ }));
  await userEvent.click(await screen.findByRole("option", { name: "Sale" }));
  expect(screen.getByText("1 Result Matched")).toBeTruthy();

  await userEvent.click(screen.getByRole("button", { name: /^Sale/ }));
  await userEvent.click(await screen.findByRole("option", { name: "Sale & Rent" }));
  await userEvent.click(screen.getByRole("button", { name: /All Types/ }));
  await userEvent.click(await screen.findByRole("option", { name: "Office" }));
  expect(screen.getByText("1 Result Matched")).toBeTruthy();

  await userEvent.click(screen.getByRole("button", { name: /Office/ }));
  await userEvent.click(await screen.findByRole("option", { name: "All Types" }));
  await userEvent.click(screen.getByRole("button", { name: /All Location/ }));
  await userEvent.click(await screen.findByRole("option", { name: "Giza" }));
  expect(screen.getByText("Property 5")).toBeTruthy();
  expect(calls).toHaveLength(1);
});

test("no match -> 'No Things Matched' with the header, no '0 Results Matched'", async () => {
  renderPage();
  await screen.findByText("Property 1");
  await userEvent.type(screen.getByRole("textbox", { name: "Search Your Properties" }), "zzz");
  expect(screen.getByText("No Things Matched To Your Search")).toBeTruthy();
  expect(screen.queryByText(/Matched$/)).toBeNull();
  expect(screen.getAllByRole("columnheader").length).toBe(6);
});

test("account with no properties -> illustration text + Add Property button (and the header one)", async () => {
  pages = () => json({ data: [], meta: { total: 0, page: 1, limit: 50, totalPages: 0 } });
  renderPage();
  expect(await screen.findByText("You haven't posted any properties")).toBeTruthy();
  expect(screen.getAllByRole("link", { name: "Add Property" }).length).toBe(2);
  expect(screen.queryByRole("textbox")).toBeNull();
  await userEvent.click(screen.getAllByRole("link", { name: "Add Property" })[1]);
  expect(await screen.findByText("ADD PAGE")).toBeTruthy();
});

test("row click opens the details page", async () => {
  renderPage();
  await screen.findByText("Property 3");
  await userEvent.click(within(rowOf("Property 3")).getByText("Maadi, Cairo"));
  expect(await screen.findByText("DETAILS PAGE")).toBeTruthy();
});

test("pagination of the filtered list (10 per page)", async () => {
  const many = Array.from({ length: 23 }, (_, i) => property(i + 1));
  pages = () => json({ data: many, meta: { total: 23, page: 1, limit: 50, totalPages: 1 } });
  renderPage();
  await screen.findByText("Property 1");
  expect(screen.getAllByRole("row").length).toBe(11);
  await userEvent.click(within(screen.getByRole("navigation", { name: "Pagination" })).getByRole("button", { name: "Page 3" }));
  expect(screen.getAllByRole("row").length).toBe(4);                 // header + 3
});

test("401 -> session message; 403 -> server message + Try again; unknown shape -> clear error", async () => {
  pages = () => json({ Error: "Invalid token" }, 401);
  const a = renderPage();
  expect(await screen.findByText("Your session is invalid or has expired. Please log in again.")).toBeTruthy();
  a.unmount();

  let n = 0;
  pages = () => (n++ === 0 ? json({ Error: "Forbidden" }, 403) : json({ data: [property(1)], meta: { total: 1, page: 1, limit: 50, totalPages: 1 } }));
  const b = renderPage();
  const alert = await screen.findByRole("alert");
  await userEvent.click(within(alert).getByRole("button", { name: "Try again" }));
  expect(await screen.findByText("Property 1")).toBeTruthy();
  b.unmount();

  pages = () => json({ weird: 1 });
  renderPage();
  expect(await screen.findByText("Unexpected response from the server.")).toBeTruthy();
});
