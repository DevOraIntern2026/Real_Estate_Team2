import { useState } from "react";
import logo from "../../../../../public/dashboardImgs/logo.png";
import { Link, NavLink } from "react-router-dom";
import { PROFILE_PATH } from "../../constants/paths";
import { useAdmin } from "../../context/AdminContext";
import { useNotifications } from "../../context/NotificationsContext";

type SideLink = {
  label: string;
  to: string;
  icon: string;
  badge?: number;
};

// static links only: the badge is added dynamically inside the component
const links: SideLink[] = [
  { label: "Overview", to: "/", icon: "fa-regular fa-house" },
  { label: "Listing", to: "/listing", icon: "fa-solid fa-list-check" },
  { label: "Users", to: "/users", icon: "fa-solid fa-user-group" },
  { label: "Notification", to: "/notification", icon: "fa-regular fa-bell" },
  { label: "Reports", to: "/reports", icon: "fa-regular fa-newspaper" },
];

export default function SideBar() {
  const [open, setOpen] = useState(false);
  const { unreadCount } = useNotifications();
  const { admin } = useAdmin(); // was: const admin = { name: "Omar Omran" }

  const initials = admin.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const navItems: SideLink[] = links.map((link) => ({
    ...link,
    badge: link.to === "/notification" ? unreadCount : undefined,
  }));

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open sidebar"
        className="fixed top-3 start-3 z-30 rounded-sm border border-[#87400E] bg-[#FAFAFA] p-2 text-[#87400E] md:hidden"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
        >
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
        />
      )}

      <aside
        aria-label="Sidebar"
        className={`fixed start-0 top-0 z-40 flex h-screen w-80 flex-col overflow-y-auto bg-[#87400E] p-6 transition-transform md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full rtl:translate-x-full"
        }`}
      >
        <div className="mb-5 flex items-center justify-between border-b border-[#F7F7F6] pb-4">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Homli logo" className="h-10 w-25 bg-[#F7F7F6] rounded-2xl p-2" />
            <div className="flex flex-col items-center font-medium text-[#F7F7F6]">
              <span className="text-xs">Admin</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close sidebar"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F7F7F6] text-[#87400E]"
          >
            <i className="fa-solid fa-bars md:inline" />
          </button>
        </div>

        <ul className="flex-1 space-y-1">
          {navItems.map(({ label, to, icon, badge }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === "/"}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[#FAFAFA] text-[#87400E]"
                      : "text-[#F7F7F6] hover:bg-white/10"
                  }`
                }
              >
                <i className={`${icon} w-5 text-center`} />
                <span className="flex-1">{label}</span>
                {badge ? (
                  <span
                    aria-label={`${badge} unread`}
                    className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#F7F7F6] px-1 text-xs text-[#87400E]"
                  >
                    {badge > 9 ? "9+" : badge}
                  </span>
                ) : null}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Admin: click -> profile page */}
        <div className="mt-6 flex items-center justify-between gap-2 border-t border-[#F7F7F6]/40 pt-4">
          <NavLink
            to={PROFILE_PATH}
            onClick={() => setOpen(false)}
            aria-label="Open my profile"
            className={({ isActive }) =>
              `flex min-w-0 flex-1 items-center gap-2 rounded-sm p-1 transition-colors hover:bg-white/10 ${
                isActive ? "bg-white/15" : ""
              }`
            }
          >
            {admin.avatar ? (
              <img
                src={admin.avatar}
                alt=""
                className="h-8 w-8 shrink-0 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F7F7F6] text-xs font-medium text-[#87400E]">
                {initials}
              </span>
            )}
            <p className="truncate text-sm font-medium text-[#F7F7F6]">
              {admin.name}
            </p>
          </NavLink>

          <Link
            to={PROFILE_PATH}
            onClick={() => setOpen(false)}
            aria-label="Settings"
            className="p-1 text-[#F7F7F6] hover:opacity-80"
          >
            <i className="fa-solid fa-gear" />
          </Link>
        </div>
      </aside>
    </>
  );
}
