import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { MockSessionProvider } from "../../../context/MockSessionProvider";
import { ownerMock } from "../../../data/owner.mock";
import InquiryReply from "./InquiryReply";
import { buildThread, normalizeMessages } from "./mappers";

const json = (body: unknown, status = 200) =>
  Promise.resolve(new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } }));

const detail = () => ({
  id: "i1", customerName: "Ahmed Nasser", customerEmail: "ahmed@mail.com", customerPhone: "+21234567890",
  message: "I want to inquire about this property.", status: "new", createdAt: "2026-09-20T16:32:00.000Z",
  property: { title: "Modern 3-Bedroom Apartment", propertyType: "apartment", transaction: "sale", price: 4500000, currency: "EGP" },
});

let messages: unknown[];
let calls: { url: string; method: string; body?: unknown }[];
let detailResponse: () => Promise<Response>;
let messagesResponse: () => Promise<Response>;
let postResponse: () => Promise<Response>;

beforeEach(() => {
  calls = [];
  messages = [
    { id: "m1", sender: "customer", message: "I want to inquire about this property.", createdAt: "2026-09-20T16:32:00.000Z" },
    { id: "m2", sender: "owner", message: "Yes, we can negotiate.", createdAt: "2026-09-22T16:32:00.000Z" },
  ];
  detailResponse = () => json(detail());
  messagesResponse = () => json(messages);
  postResponse = () => {
    messages.push({ id: `m${messages.length + 1}`, sender: "owner", message: "NEW REPLY", createdAt: "2026-09-23T10:00:00.000Z" });
    return json({ ok: true });
  };
  vi.stubGlobal("fetch", vi.fn((url: string, init: RequestInit = {}) => {
    calls.push({ url, method: init.method ?? "GET", body: init.body });
    if (url === "/inquiries/i1" ) return detailResponse();
    if (url === "/inquiries/i1/messages" && init.method === "POST") return postResponse();
    if (url === "/inquiries/i1/messages") return messagesResponse();
    return json({ Error: "Inquiry not found" }, 404);
  }));
  localStorage.setItem("ACCESS_TOKEN", "owner-jwt");
});
afterEach(() => { vi.unstubAllGlobals(); localStorage.clear(); });

function renderPage(id = "i1") {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MockSessionProvider initialAdmin={ownerMock}>
        <MemoryRouter initialEntries={[`/owner/inquiries/${id}`]}>
          <Routes><Route path="owner/inquiries/:inquiryId" element={<InquiryReply />} /></Routes>
        </MemoryRouter>
      </MockSessionProvider>
    </QueryClientProvider>
  );
}

test("loads details + messages; customer card, submission info and the two sides of the chat", async () => {
  renderPage();
  const customer = within(await screen.findByRole("region", { name: "Customer" }));
  expect(customer.getByText("Ahmed Nasser")).toBeTruthy();
  expect(customer.getByText("ahmed@mail.com")).toBeTruthy();
  expect(customer.getByText("+21234567890")).toBeTruthy();

  expect(screen.getByText("Modern 3-Bedroom Apartment")).toBeTruthy();
  expect(screen.getByText("Apartment")).toBeTruthy();
  expect(screen.getByText("Sale")).toBeTruthy();
  expect(screen.getByText("4,500,000 EGP")).toBeTruthy();

  const log = within(await screen.findByRole("log", { name: "Conversation" }));
  expect(log.getByText("Customer:")).toBeTruthy();
  expect(log.getByText("You:")).toBeTruthy();
  expect(log.getAllByText("I want to inquire about this property.").length).toBe(1);   // not duplicated
  expect(calls.map((c) => c.url).sort()).toEqual(["/inquiries/i1", "/inquiries/i1/messages"]);
});

test("send: POST { message }, the reply appears (from the refetch), input clears, Enter works", async () => {
  renderPage();
  await screen.findByRole("log", { name: "Conversation" });
  const input = screen.getByRole("textbox", { name: "Your reply" }) as HTMLInputElement;
  const send = screen.getByRole("button", { name: "Send" }) as HTMLButtonElement;
  expect(send.disabled).toBe(true);
  await userEvent.type(input, "Thanks!{enter}");

  await waitFor(() => expect(within(screen.getByRole("log")).getByText("NEW REPLY")).toBeTruthy());
  const post = calls.find((c) => c.method === "POST")!;
  expect(post.url).toBe("/inquiries/i1/messages");
  expect(JSON.parse(String(post.body))).toEqual({ message: "Thanks!" });
  expect(input.value).toBe("");
});

test("send fails -> the server message shows under the box and the text is kept", async () => {
  postResponse = () => json({ Error: "Message is required" }, 400);
  renderPage();
  await screen.findByRole("log", { name: "Conversation" });
  const input = screen.getByRole("textbox", { name: "Your reply" }) as HTMLInputElement;
  await userEvent.type(input, "hello{enter}");
  expect((await screen.findByRole("alert")).textContent).toBe("Message is required");
  expect(input.value).toBe("hello");
});

test("404 -> 'Inquiry not found.'; a failing messages request doesn't hide the rest of the page", async () => {
  detailResponse = () => json({ Error: "Inquiry not found" }, 404);
  const { unmount } = renderPage();
  expect(await screen.findByText(/Inquiry not found\./)).toBeTruthy();
  unmount();

  detailResponse = () => json(detail());
  messagesResponse = () => json({ Error: "Messages unavailable" }, 500);
  renderPage();
  expect(await screen.findByText("Ahmed Nasser")).toBeTruthy();
  expect(await screen.findByText("Messages unavailable")).toBeTruthy();
});

test("thread rules: the first message is added only if the messages endpoint doesn't contain it", () => {
  const d = { id: "i1", message: "first", createdAt: "2026-01-01T00:00:00Z" } as never;
  const reply = normalizeMessages([{ id: "r", sender: "owner", message: "reply", createdAt: "2026-01-02T00:00:00Z" }]);
  expect(buildThread(d, reply).map((m) => m.text)).toEqual(["first", "reply"]);
  const both = normalizeMessages([
    { id: "a", sender: "customer", message: "first", createdAt: "2026-01-01T00:00:00Z" },
    { id: "r", sender: "owner", message: "reply", createdAt: "2026-01-02T00:00:00Z" },
  ]);
  expect(buildThread(d, both).map((m) => m.text)).toEqual(["first", "reply"]);
  expect(buildThread(d, []).map((m) => m.text)).toEqual(["first"]);
});

test("normalizeMessages: other sender field names, wrapped list, sorted oldest first", () => {
  const list = normalizeMessages({ data: [
    { _id: "2", senderType: "owner", text: "b", createdAt: "2026-01-02T00:00:00Z" },
    { _id: "1", from: "Customer", content: "a", createdAt: "2026-01-01T00:00:00Z" },
    { _id: "3", isCustomer: true, message: "c", createdAt: "2026-01-03T00:00:00Z" },
  ] });
  expect(list.map((m) => [m.text, m.mine])).toEqual([["a", false], ["b", true], ["c", false]]);
});
