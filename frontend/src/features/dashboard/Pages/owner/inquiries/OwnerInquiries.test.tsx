import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { MockSessionProvider } from "../../../context/MockSessionProvider";
import { ownerMock } from "../../../data/owner.mock";
import OwnerInquiries from "./OwnerInquiries";

const inquiry = (n: number, over: Record<string, unknown> = {}) => ({
  id: `i${n}`, propertyId: `p${n}`,
  property: { id: `p${n}`, title: `Villa ${n}`, code: `DEV-${n}`, propertyType: "office", transaction: "sale" },
  customerName: `Customer ${n}`, customerEmail: `c${n}@mail.com`, customerPhone: "+201234567890",
  message: "Is the place still available for rent?", status: "new", createdAt: "2026-09-20T10:00:00.000Z", ...over,
});
const json = (body: unknown, status = 200) =>
  Promise.resolve(new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } }));

let calls: { url: string; auth?: string }[];
let listBody: () => Promise<Response>;
const last = () => new URL(calls.at(-1)!.url, "http://x").searchParams;

beforeEach(() => {
  calls = [];
  listBody = () => json({ data: [inquiry(1), inquiry(2, { status: "responded" }), inquiry(3, { status: "closed" })], meta: { total: 25, page: 1, limit: 10, totalPages: 3 } });
  vi.stubGlobal("fetch", vi.fn((url: string, init: RequestInit = {}) => {
    calls.push({ url, auth: (init.headers as Record<string, string>)?.Authorization });
    return listBody();
  }));
  localStorage.setItem("ACCESS_TOKEN", "owner-jwt");
});
afterEach(() => { vi.unstubAllGlobals(); localStorage.clear(); });

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MockSessionProvider initialAdmin={ownerMock}>
        <MemoryRouter initialEntries={["/owner/inquiries"]}>
          <Routes>
            <Route path="owner/inquiries" element={<OwnerInquiries />} />
            <Route path="owner/inquiries/:inquiryId" element={<div>REPLY PAGE</div>} />
          </Routes>
        </MemoryRouter>
      </MockSessionProvider>
    </QueryClientProvider>
  );
}

test("GET /inquiries?page=1&limit=10 (no status for All) with the Bearer token; rows mapped", async () => {
  renderPage();
  expect(screen.getByRole("status")).toBeTruthy();
  await screen.findByText("Customer 1");
  expect(calls[0].url).toBe("/inquiries?page=1&limit=10");
  expect(calls[0].auth).toBe("Bearer owner-jwt");

  const row = screen.getByText("Customer 1").closest("tr")!;
  expect(within(row).getByText("Villa 1")).toBeTruthy();
  expect(within(row).getByText("Office-Sale")).toBeTruthy();
  expect(within(row).getByText("+201234567890")).toBeTruthy();
  expect(within(row).getByText("New")).toBeTruthy();
  expect(within(screen.getByText("Customer 2").closest("tr")!).getByText("Responded")).toBeTruthy();
  expect(within(screen.getByText("Customer 3").closest("tr")!).getByText("Closed")).toBeTruthy();
});

test("tabs send status=new|responded and reset the page; label shows the count", async () => {
  renderPage();
  await screen.findByText("Customer 1");
  await userEvent.click(within(screen.getByRole("navigation", { name: "Pagination" })).getByRole("button", { name: "Page 2" }));
  await waitFor(() => expect(last().get("page")).toBe("2"));

  await userEvent.click(screen.getByRole("tab", { name: "New" }));
  await waitFor(() => expect(last().get("status")).toBe("new"));
  expect(last().get("page")).toBe("1");
  expect(await screen.findByText("25 Results Matched")).toBeTruthy();

  await userEvent.click(screen.getByRole("tab", { name: "Responded" }));
  await waitFor(() => expect(last().get("status")).toBe("responded"));

  await userEvent.click(screen.getByRole("tab", { name: "All" }));
  await waitFor(() => expect(last().has("status")).toBe(false));
});

test("click a row (or the customer link) opens the reply page", async () => {
  renderPage();
  await screen.findByText("Customer 1");
  await userEvent.click(within(screen.getByText("Customer 2").closest("tr")!).getByText("+201234567890"));
  expect(await screen.findByText("REPLY PAGE")).toBeTruthy();
});

test("no inquiries at all -> illustration text + hint; the tabs stay", async () => {
  listBody = () => json({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } });
  renderPage();
  expect(await screen.findByText("There are no inquiries about your properties.")).toBeTruthy();
  expect(screen.getByText("Keep moving forward with your real estate work")).toBeTruthy();
  expect(screen.getByRole("tab", { name: "Responded" })).toBeTruthy();
});

test("empty tab (not empty account) -> 'No Things Matched' with the table header, no '0 Results Matched'", async () => {
  renderPage();
  await screen.findByText("Customer 1");
  listBody = () => json({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } });
  await userEvent.click(screen.getByRole("tab", { name: "Responded" }));
  expect(await screen.findByText("No Things Matched To Your Search")).toBeTruthy();
  expect(screen.queryByText(/Matched$/)).toBeNull();
  expect(screen.getAllByRole("columnheader").length).toBe(7);
});

test("401 -> session message; 403 -> server message + Try again; unknown shape -> clear error", async () => {
  listBody = () => json({ Error: "Invalid token" }, 401);
  const { unmount } = renderPage();
  expect(await screen.findByText("Your session is invalid or has expired. Please log in again.")).toBeTruthy();
  unmount();

  let n = 0;
  const ok = () => json({ data: [inquiry(1)], meta: { total: 1, page: 1, limit: 10, totalPages: 1 } });
  listBody = () => (n++ === 0 ? json({ Error: "Forbidden - owner only" }, 403) : ok());
  const second = renderPage();
  const alert = await screen.findByRole("alert");
  expect(within(alert).getByText("Forbidden - owner only")).toBeTruthy();
  await userEvent.click(within(alert).getByRole("button", { name: "Try again" }));
  expect(await screen.findByText("Customer 1")).toBeTruthy();
  second.unmount();

  listBody = () => json({ weird: 1 });
  renderPage();
  expect(await screen.findByText("Unexpected response from the server.")).toBeTruthy();
});
