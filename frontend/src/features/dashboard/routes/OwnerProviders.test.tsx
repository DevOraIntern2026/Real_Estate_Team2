import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { expect, test } from "vitest";
import Profile from "../pages/profile/Profile";
import OwnerProviders from "./OwnerProviders";

test("owner tree still works on the mock session: Role + Delete Account, no API call needed", async () => {
  render(
    <MemoryRouter initialEntries={["/owner/profile"]}>
      <Routes>
        <Route path="owner" element={<OwnerProviders />}>
          <Route path="profile" element={<Profile showRole allowDelete />} />
        </Route>
        <Route path="login" element={<div>LOGIN PAGE</div>} />
      </Routes>
    </MemoryRouter>
  );
  expect((screen.getByLabelText("Role") as HTMLInputElement).value).toBe("Owner");
  await userEvent.click(screen.getByRole("button", { name: "Delete Account" }));
  const d = within(screen.getByRole("dialog", { name: "Delete Account of DevOra?", hidden: true }));
  await userEvent.click(d.getByRole("button", { name: "Delete Account" }));
  expect(await screen.findByText("LOGIN PAGE")).toBeTruthy();
});
