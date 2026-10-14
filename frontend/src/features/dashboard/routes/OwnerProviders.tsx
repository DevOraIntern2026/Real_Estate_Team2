import { Outlet } from "react-router-dom";
import { AdminProvider } from "../context/AdminContext";
import { InquiriesProvider } from "../context/InquiriesContext";
import { NotificationsProvider } from "../context/NotificationsContext";
import { ownerNotificationsMock } from "../data/ownerNotifications.mock";
import { ownerMock } from "../data/owner.mock";

/**
 * Gives the whole /owner tree ITS OWN logged-in user + notifications.
 * (Same providers as admin, different data. With real login, the data comes from the API.)
 * PropertiesProvider stays at the app root: both dashboards read the same listings.
 */
export default function OwnerProviders() {
  return (
    <AdminProvider initialAdmin={ownerMock}>
      <NotificationsProvider initialNotifications={ownerNotificationsMock}>
        <InquiriesProvider>
          <Outlet />
        </InquiriesProvider>
      </NotificationsProvider>
    </AdminProvider>
  );
}
