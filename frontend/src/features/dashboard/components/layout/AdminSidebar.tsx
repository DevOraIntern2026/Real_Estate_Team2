import { ADMIN_PATHS, PROFILE_PATH } from "../../constants/paths";
import { useNotifications } from "../../context/NotificationsContext";
import AppSidebar from "./AppSidebar";
import { adminLinks } from "./navLinks";

/** Use this where you used <SideBar /> in the admin layout. */
export default function AdminSidebar() {
  const { unreadCount } = useNotifications();
  return (
    <AppSidebar
      links={adminLinks}
      roleLabel="Admin"
      profilePath={PROFILE_PATH}
      badges={{ [ADMIN_PATHS.notification]: unreadCount }}
    />
  );
}
