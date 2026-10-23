import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { MockSessionProvider } from "../../../context/MockSessionProvider";
import { ownerMock } from "../../../data/owner.mock";
import { normalizeOwnerProperty } from "./mappers";
import PropertyDetails from "./PropertyDetails";

const json = (body: unknown, status = 200) =>
  Promise.resolve(new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } }));

const published = () => ({
  id: "p1", code: "DEV-1042", title: "Modern 3-Bedroom Apartment in New Cairo", description: "A bright apartment.",
  propertyType: "apartment", transaction: "sale", price: 4500000, currency: "EGP", status: "published",
  address: "Fifth Settlement, New Cairo, Egypt", size: 1400, bedrooms: 3, bathrooms: 2, furnishing: "semi_furnished",
  facilities: ["Elevator", { name: "Parking" }], nearby: ["Mosque", "School"],
  images: ["https://img/1.jpg", { url: "https://img/2.jpg" }],
  createdAt: "2026-09-13T10:00:00.000Z", submittedAt: "2026-12-21T10:00:00.000Z", updatedAt: "2026-09-24T10:00:00.000Z",
  views: 15, inquiriesCount: 294,
});

let calls: { url: string; method: string }[];
let getResponse: () => Promise<Response>;
let deleteResponse: () => Promise<Response>;

beforeEach(() => {
  calls = [];
  getResponse = () => json(published());
  deleteResponse = () => json({ ok: true });
  vi.stubGlobal("fetch", vi.fn((url: string, init: RequestInit = {}) => {
    calls.push({ url, method: init.method ?? "GET" });
    if (url === "/properties/p1" && init.method === "DELETE") return deleteResponse();
    if (url === "/properties/p1") return getResponse();
    return json({ Error: "Property not found" }, 404);
  }));
  localStorage.setItem("ACCESS_TOKEN", "owner-jwt");
});
afterEach(() => { vi.unstubAllGlobals(); localStorage.clear(); });

function renderPage(id = "p1") {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MockSessionProvider initialAdmin={ownerMock}>
        <MemoryRouter initialEntries={[`/owner/properties/${id}`]}>
          <Routes>
            <Route path="owner/properties/:propertyId" element={<PropertyDetails />} />
            <Route path="owner/properties/:propertyId/edit" element={<div>EDIT PAGE</div>} />
            <Route path="owner/properties" element={<div>LIST PAGE</div>} />
          </Routes>
        </MemoryRouter>
      </MockSessionProvider>
    </QueryClientProvider>
  );
}
const dlg = () => within(screen.getByRole("dialog", { name: "Delete this property?", hidden: true }));

test("published: every section is filled from GET /properties/{id}; no Continue Editing", async () => {
  renderPage();
  expect(screen.getByRole("status")).toBeTruthy();
  expect(await screen.findByRole("heading", { name: "Modern 3-Bedroom Apartment in New Cairo" })).toBeTruthy();
  expect(calls[0]).toEqual({ url: "/properties/p1", method: "GET" });

  const info = within(screen.getByText("Property Information").closest("section")!);
  expect(info.getByText("DEV-1042")).toBeTruthy();
  expect(info.getByText("Apartment")).toBeTruthy();
  expect(info.getByText("Sale")).toBeTruthy();
  expect(info.getByText("4,500,000 EGP")).toBeTruthy();
  expect(info.getByText("Fifth Settlement, New Cairo, Egypt")).toBeTruthy();
  expect(info.getByText("1400 sq.ft")).toBeTruthy();
  expect(info.getByText("Semi Furnished")).toBeTruthy();

  expect(screen.getByText("Elevator")).toBeTruthy();
  expect(screen.getByText("Parking")).toBeTruthy();                       // { name } form
  expect(screen.getByText("Mosque")).toBeTruthy();
  expect(screen.getByText("A bright apartment.")).toBeTruthy();

  const perf = within(screen.getByText("Performance Indicators").closest("section")!);
  expect(perf.getByText("15")).toBeTruthy();
  expect(perf.getByText("294")).toBeTruthy();

  const sub = within(screen.getByText("Submission Info").closest("section")!);
  expect(sub.getByText("Created")).toBeTruthy();
  expect(sub.getByText("Submitted")).toBeTruthy();
  expect(sub.getByText("Published")).toBeTruthy();
  expect(screen.queryByRole("link", { name: "Continue Editing" })).toBeNull();
  expect(screen.getByRole("button", { name: "Delete" })).toBeTruthy();
});

test("draft: Continue Editing is shown and 'Submitted' is hidden (never submitted)", async () => {
  getResponse = () => json({ ...published(), status: "draft", submittedAt: undefined, views: undefined, inquiriesCount: undefined });
  renderPage();
  await screen.findByRole("heading", { name: /Modern 3-Bedroom/ });
  const sub = within(screen.getByText("Submission Info").closest("section")!);
  expect(sub.queryByText("Submitted")).toBeNull();
  expect(sub.getByText("Draft")).toBeTruthy();
  expect(within(screen.getByText("Performance Indicators").closest("section")!).getAllByText("0").length).toBe(2);
  await userEvent.click(screen.getByRole("link", { name: "Continue Editing" }));
  expect(await screen.findByText("EDIT PAGE")).toBeTruthy();
});

test("delete: confirm -> DELETE /properties/p1 -> back to the list", async () => {
  renderPage();
  await screen.findByRole("heading", { name: /Modern 3-Bedroom/ });
  await userEvent.click(screen.getByRole("button", { name: "Delete" }));
  await userEvent.click(dlg().getByRole("button", { name: "Delete" }));
  expect(await screen.findByText("LIST PAGE")).toBeTruthy();
  expect(calls.some((c) => c.method === "DELETE" && c.url === "/properties/p1")).toBe(true);
});

test("delete fails -> the server message shows in the dialog and the page stays", async () => {
  deleteResponse = () => json({ Error: "Property has active inquiries" }, 409);
  renderPage();
  await screen.findByRole("heading", { name: /Modern 3-Bedroom/ });
  await userEvent.click(screen.getByRole("button", { name: "Delete" }));
  await userEvent.click(dlg().getByRole("button", { name: "Delete" }));
  expect((await dlg().findByRole("alert")).textContent).toBe("Property has active inquiries");
  expect(screen.queryByText("LIST PAGE")).toBeNull();
});

test("404 -> 'Property not found.'; 500 -> retry panel; unknown shape -> clear error", async () => {
  const a = renderPage("nope");
  expect(await screen.findByText(/Property not found\./)).toBeTruthy();
  a.unmount();

  getResponse = () => json({ Error: "Server exploded" }, 500);
  const b = renderPage();
  expect(await screen.findByText("Server exploded")).toBeTruthy();
  b.unmount();

  getResponse = () => json({ nothing: 1 });
  renderPage();
  expect(await screen.findByText("Unexpected response from the server.")).toBeTruthy();
});

test("mapper survives missing optional fields", () => {
  const vm = normalizeOwnerProperty({ _id: "z", title: "T", status: "weird_status" });
  expect(vm).toMatchObject({ id: "z", title: "T", priceLabel: "—", images: [], facilities: [], views: 0, isDraft: false });
  expect(vm.status).toMatchObject({ label: "Weird Status", tone: "neutral", tab: null });
});
