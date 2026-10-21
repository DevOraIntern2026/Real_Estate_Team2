import { Outlet } from "react-router-dom";
import { InquiriesProvider } from "../context/InquiriesContext";
import { MockSessionProvider } from "../context/MockSessionProvider";
import { NotificationsProvider } from "../context/NotificationsContext";
import { PropertiesProvider } from "../context/PropertiesContext";
import { ownerNotificationsMock } from "../data/ownerNotifications.mock";
import { ownerMock } from "../data/owner.mock";

/** The /owner tree still uses fake data (the owner API isn't integrated yet). */
export default function OwnerProviders() {
  return (
    <MockSessionProvider initialAdmin={ownerMock}>
      <PropertiesProvider>
        <NotificationsProvider initialNotifications={ownerNotificationsMock}>
          <InquiriesProvider>
            <Outlet />
          </InquiriesProvider>
        </NotificationsProvider>
      </PropertiesProvider>
    </MockSessionProvider>
  );
}
