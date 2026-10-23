import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import logo from "../../../../../public/dashboardImgs/logo.png";
import { useAdmin } from "../../context/AdminContext";

export type SidebarLink = {
  label: string;
  to: string;
  icon: string;
  end?: boolean; // true for the "home" link so it isn't active everywhere
  disabled?: boolean;
};

type AppSidebarProps = {
  links: SidebarLink[];
  roleLabel: string; // "Admin" | "Owner" (under the logo)
  profilePath?: string;
  /** badge counts by link path, e.g. { "/owner/notifications": 3 } */
  badges?: Record<string, number>;
  showUserRole?: boolean;
};

export default function AppSidebar({
  links,
  roleLabel,
  profilePath,
  badges = {},
  showUserRole = false,
}: AppSidebarProps) {
  const [open, setOpen] = useState(false);
  const { admin } = useAdmin(); // the logged-in person (admin or owner)

  const initials = admin.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const identity = (
    <>
      {admin.avatar ? (
        <img src={admin.avatar} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
      ) : (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F7F7F6] text-xs font-medium text-[#87400E]">
          {initials}
        </span>
      )}
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-[#F7F7F6]">{admin.name}</p>
        {showUserRole && <p className="text-xs text-[#F7F7F6]/80">{admin.role}</p>}
      </div>
    </>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open sidebar"
        className="fixed top-3 start-3 z-30 rounded-sm border border-[#87400E] bg-[#FAFAFA] p-2 text-[#87400E] md:hidden"
      >
        <i className="fa-solid fa-bars" />
      </button>

      {open && (
        <div onClick={() => setOpen(false)} className="fixed inset-0 z-30 bg-black/40 md:hidden" />
      )}

      <aside
        aria-label="Sidebar"
        className={`fixed start-0 top-0 z-40 flex h-screen w-80 flex-col overflow-y-auto bg-[#87400E] p-6 transition-transform md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full rtl:translate-x-full"
        }`}
      >
        <div className="mb-5 flex items-center justify-between border-b border-[#F7F7F6] pb-4">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Devora logo" className="h-10 w-20 bg-[#F7F7F6] p-1 rounded-2xl" />
            <span className="text-xs font-medium text-[#F7F7F6]">{roleLabel}</span>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close sidebar"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F7F7F6] text-[#87400E]"
          >
            <i className="fa-solid fa-bars" />
          </button>
        </div>

        <ul className="flex-1 space-y-1">
          {links.map(({ label, to, icon, end, disabled }) => {
            const badge = badges[to];
            return (
              <li key={to}>
                {disabled ? (
                  <span
                    aria-disabled="true"
                    className="flex cursor-not-allowed items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium text-[#F7F7F6]/60"
                  >
                    <i className={`${icon} w-5 text-center`} />
                    <span className="flex-1">{label}</span>
                    <span className="text-xs">Coming soon</span>
                  </span>
                ) : (
                  <NavLink
                    to={to}
                    end={end}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium transition-colors ${
                        isActive ? "bg-[#FAFAFA] text-[#87400E]" : "text-[#F7F7F6] hover:bg-white/10"
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
                )}
              </li>
            );
          })}
        </ul>

        <div className="mt-6 flex items-center justify-between gap-2 border-t border-[#F7F7F6]/40 pt-4">
          {profilePath ? (
            <>
              <NavLink
                to={profilePath}
                onClick={() => setOpen(false)}
                aria-label="Open my profile"
                className={({ isActive }) =>
                  `flex min-w-0 flex-1 items-center gap-2 rounded-sm p-1 transition-colors hover:bg-white/10 ${
                    isActive ? "bg-white/15" : ""
                  }`
                }
              >
                {identity}
              </NavLink>
              <Link
                to={profilePath}
                onClick={() => setOpen(false)}
                aria-label="Settings"
                className="p-1 text-[#F7F7F6] hover:opacity-80"
              >
                <i className="fa-solid fa-gear" />
              </Link>
            </>
          ) : (
            <div className="flex min-w-0 flex-1 items-center gap-2 p-1">{identity}</div>
          )}
        </div>
      </aside>
    </>
  );
}
