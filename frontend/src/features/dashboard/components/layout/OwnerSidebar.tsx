import { OWNER_PATHS } from "../../constants/paths";
import { useNotifications } from "../../context/NotificationsContext";
import AppSidebar from "./AppSidebar";
import { ownerLinks } from "./navLinks";

export default function OwnerSidebar() {
  const { unreadCount } = useNotifications();
  return (
    <AppSidebar
      links={ownerLinks}
      roleLabel="Owner"
      badges={{ [OWNER_PATHS.notifications]: unreadCount }}
      showUserRole
    />
  );
}
