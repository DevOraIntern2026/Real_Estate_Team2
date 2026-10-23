import { Outlet } from "react-router-dom";
import { MockSessionProvider } from "../context/MockSessionProvider";
import { NotificationsProvider } from "../context/NotificationsContext";
import { ownerNotificationsMock } from "../data/ownerNotifications.mock";
import { ownerMock } from "../data/owner.mock";

/** Still fake: the session (name) and the notifications. Inquiries now come from the API. */
export default function OwnerProviders() {
  return (
    <MockSessionProvider initialAdmin={ownerMock}>
      <NotificationsProvider initialNotifications={ownerNotificationsMock}>
        <Outlet />
      </NotificationsProvider>
    </MockSessionProvider>
  );
}
