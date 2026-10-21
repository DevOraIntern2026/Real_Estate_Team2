import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { setUnauthorizedHandler, tokenStorage } from "../../../api";
import Profile from "../pages/profile/Profile";
import { AdminProvider, useAdmin } from "./AdminContext";
import PageHeader from "../components/common/PageHeader";

const json = (body: unknown, status = 200) =>
  Promise.resolve(new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } }));

type Call = { url: string; method: string; body?: unknown; headers: Record<string, string> };
let calls: Call[];
let profile: Record<string, unknown>;
let patchResponse: () => Promise<Response>;
let photoResponse: () => Promise<Response>;
let passwordResponse: () => Promise<Response>;
let profileResponse: () => Promise<Response>;

beforeEach(() => {
  calls = [];
  profile = { id: "a1", name: "Omar Omran", email: "omar@devora.com", phone: "+201234567890", location: "Cairo", avatar: "" };
  profileResponse = () => json(profile);
  patchResponse = () => json({ ok: true });
  photoResponse = () => json({ ok: true });
  passwordResponse = () => json({ ok: true });
  tokenStorage.set("admin-jwt");
  vi.stubGlobal("fetch", vi.fn((url: string, init: RequestInit = {}) => {
    calls.push({ url, method: init.method ?? "GET", body: init.body, headers: (init.headers ?? {}) as Record<string, string> });
    if (url === "/v1/admin/profile" && (!init.method || init.method === "GET")) return profileResponse();
    if (url === "/v1/admin/profile" && init.method === "PATCH") {
      const res = patchResponse();
      Object.assign(profile, JSON.parse(String(init.body))); // the "server" applies the change
      return res;
    }
    if (url === "/v1/admin/profile/photo") { profile.avatar = "https://res.cloudinary.com/x/me.png"; return photoResponse(); }
    if (url === "/v1/admin/profile/password") return passwordResponse();
    return json({ Error: "not mocked" }, 404);
  }));
});
afterEach(() => { vi.unstubAllGlobals(); setUnauthorizedHandler(null); tokenStorage.clear(); });

function renderApp(ui: React.ReactNode, client = new QueryClient({ defaultOptions: { queries: { retry: false } } })) {
  return { client, ...render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={["/profile"]}>
        <AdminProvider>
          <Routes>
            <Route path="profile" element={ui} />
            <Route path="login" element={<div>LOGIN PAGE</div>} />
          </Routes>
        </AdminProvider>
      </MemoryRouter>
    </QueryClientProvider>
  ) };
}
const dlg = (name: string) => within(screen.getByRole("dialog", { name, hidden: true }));

function WhoAmI() {
  const { admin } = useAdmin();
  return <p>{`${admin.name} | ${admin.email} | ${admin.role} | ${admin.avatar ?? "no-avatar"}`}</p>;
}

test("loads GET /v1/admin/profile with the Bearer token: loading first, then the app", async () => {
  renderApp(<WhoAmI />);
  expect(screen.getByRole("status")).toBeTruthy();
  expect(await screen.findByText("Omar Omran | omar@devora.com | Admin | no-avatar")).toBeTruthy();
  expect(calls[0].url).toBe("/v1/admin/profile");
  expect(calls[0].headers.Authorization).toBe("Bearer admin-jwt");
});

test("understands wrapped responses and other photo field names", async () => {
  profile = { data: { profile: { _id: "z9", fullName: "Sara", email: "s@x.com", photoUrl: "https://img/s.png" } } };
  profileResponse = () => json(profile);
  renderApp(<WhoAmI />);
  expect(await screen.findByText("Sara | s@x.com | Admin | https://img/s.png")).toBeTruthy();
});

test("403 shows the server message + Try again; unknown shape shows a clear error", async () => {
  let n = 0;
  profileResponse = () => (n++ === 0 ? json({ Error: "Forbidden - user does not have required Admin role" }, 403) : json(profile));
  renderApp(<WhoAmI />);
  const alert = await screen.findByRole("alert");
  expect(within(alert).getByText("Forbidden - user does not have required Admin role")).toBeTruthy();
  await userEvent.click(within(alert).getByRole("button", { name: "Try again" }));
  expect(await screen.findByText(/Omar Omran/)).toBeTruthy();
});

test("unknown profile shape -> 'Unexpected response' (no crash)", async () => {
  profileResponse = () => json({ nothing: 1 });
  renderApp(<WhoAmI />);
  expect(await screen.findByText("Unexpected response from the server.")).toBeTruthy();
});

test("edit profile: PATCH sends ONLY changed fields, then the page shows the new data", async () => {
  renderApp(<><PageHeader title="Profile" /><Profile /></>);
  await screen.findByText("Settings");
  await userEvent.click(screen.getByRole("button", { name: "Edit Profile" }));
  const d = dlg("Edit Profile");
  const name = d.getByLabelText("Name");
  await userEvent.clear(name);
  await userEvent.type(name, "Omar Ahmed");
  await userEvent.click(d.getByRole("button", { name: "Edit Profile" }));

  await waitFor(() => expect((screen.getAllByLabelText("Name")[0] as HTMLInputElement).value).toBe("Omar Ahmed"));
  const patch = calls.find((c) => c.method === "PATCH")!;
  expect(JSON.parse(String(patch.body))).toEqual({ name: "Omar Ahmed" });       // email/phone NOT sent
  expect(patch.headers["Content-Type"]).toBe("application/json");
  expect(calls.filter((c) => c.method === "GET").length).toBe(2);                // re-fetched after the change
});

test("edit profile fails (409) -> message inside the dialog, dialog stays open", async () => {
  patchResponse = () => json({ Error: "Email is already in use" }, 409);
  renderApp(<Profile />);
  await screen.findByText("Settings");
  await userEvent.click(screen.getByRole("button", { name: "Edit Profile" }));
  const d = dlg("Edit Profile");
  const email = d.getByLabelText("Email");
  await userEvent.clear(email);
  await userEvent.type(email, "taken@devora.com");
  await userEvent.click(d.getByRole("button", { name: "Edit Profile" }));
  expect((await d.findByRole("alert")).textContent).toBe("Email is already in use");
});

test("photo: multipart field 'file', then the new Cloudinary URL is shown", async () => {
  renderApp(<Profile />);
  await screen.findByText("Settings");
  await userEvent.click(screen.getByRole("button", { name: "Change Photo" }));
  const file = new File(["x"], "me.png", { type: "image/png" });
  await userEvent.upload(screen.getByTestId("photo-input"), file);

  await waitFor(() => expect(calls.some((c) => c.url === "/v1/admin/profile/photo")).toBe(true));
  const upload = calls.find((c) => c.url === "/v1/admin/profile/photo")!;
  expect(upload.method).toBe("POST");
  expect(upload.body).toBeInstanceOf(FormData);
  expect((upload.body as FormData).get("file")).toBe(file);
  expect(upload.headers["Content-Type"]).toBeUndefined();                       // browser adds the boundary
  await waitFor(() => expect(document.querySelectorAll('img[src="https://res.cloudinary.com/x/me.png"]').length).toBeGreaterThan(0));
});

test("photo upload fails -> message in the dialog (and a non-image is rejected before any request)", async () => {
  photoResponse = () => json({ Error: "File too large" }, 413);
  renderApp(<Profile />);
  await screen.findByText("Settings");
  await userEvent.click(screen.getByRole("button", { name: "Change Photo" }));
  await userEvent.upload(screen.getByTestId("photo-input"), new File(["x"], "a.txt", { type: "text/plain" }), { applyAccept: false });
  expect(await screen.findByText("Please choose an image file.")).toBeTruthy();
  expect(calls.some((c) => c.url.includes("photo"))).toBe(false);

  await userEvent.upload(screen.getByTestId("photo-input"), new File(["x"], "a.png", { type: "image/png" }));
  expect(await screen.findByText("File too large")).toBeTruthy();
});

test("password: sends currentPassword/newPassword/confirmPassword, then the success dialog", async () => {
  renderApp(<Profile />);
  await screen.findByText("Settings");
  await userEvent.click(screen.getByRole("button", { name: /Change Password/ }));
  const d = dlg("Change Password");
  await userEvent.type(d.getByLabelText("Current Password"), "OldPass@123");
  await userEvent.type(d.getByLabelText("New Password"), "NewPass@123");
  await userEvent.type(d.getByLabelText("Confirm New Password"), "NewPass@123");
  await userEvent.click(d.getByRole("button", { name: "Update Password" }));

  expect(await screen.findByText("Password Change Successfully")).toBeTruthy();
  const post = calls.find((c) => c.url === "/v1/admin/profile/password")!;
  expect(JSON.parse(String(post.body))).toEqual({
    currentPassword: "OldPass@123", newPassword: "NewPass@123", confirmPassword: "NewPass@123",
  });
});

test("wrong current password (even as a 401) shows the message and does NOT log the admin out", async () => {
  const handler = vi.fn();
  setUnauthorizedHandler(handler);
  passwordResponse = () => json({ Error: "Current password is incorrect" }, 401);
  renderApp(<Profile />);
  await screen.findByText("Settings");
  await userEvent.click(screen.getByRole("button", { name: /Change Password/ }));
  const d = dlg("Change Password");
  await userEvent.type(d.getByLabelText("Current Password"), "wrong");
  await userEvent.type(d.getByLabelText("New Password"), "NewPass@123");
  await userEvent.type(d.getByLabelText("Confirm New Password"), "NewPass@123");
  await userEvent.click(d.getByRole("button", { name: "Update Password" }));
  expect((await d.findByRole("alert")).textContent).toBe("Current password is incorrect");
  expect(handler).not.toHaveBeenCalled();
});

test("logout clears the token and the cache, then goes to login; admin has no Delete Account", async () => {
  const { client } = renderApp(<Profile />);
  await screen.findByText("Settings");
  expect(screen.queryByRole("button", { name: "Delete Account" })).toBeNull();
  await userEvent.click(screen.getByRole("button", { name: "Logout" }));
  await userEvent.click(dlg("Log out of DevOra?").getByRole("button", { name: "Logout" }));
  expect(await screen.findByText("LOGIN PAGE")).toBeTruthy();
  expect(tokenStorage.get()).toBeNull();
  expect(client.getQueryCache().getAll().length).toBe(0);
});
