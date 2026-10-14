import type { ReactNode } from "react";
import { useAdmin } from "../../context/AdminContext";
import Avatar from "./Avatar";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
  /** override the logged-in admin's photo/name if you need to */
  avatarSrc?: string;
  avatarName?: string;
  /** extra content next to the title (e.g. a search input) */
  children?: ReactNode;
};

export default function PageHeader({
  title,
  subtitle,
  onMenuClick,
  avatarSrc,
  avatarName,
  children,
}: PageHeaderProps) {
  const { admin } = useAdmin(); // photo + name now follow the profile page

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b-[0.8px] border-[#87400E] pb-4">
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Toggle menu"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#87400E] text-[#FAFAFA]"
        >
          <i className="fa-solid fa-bars" />
        </button>
        <div>
          <h1 className="font-medium text-[#241A12]">{title}</h1>
          {subtitle && <p className="text-sm text-[#5A4F49]">{subtitle}</p>}
        </div>
        {children}
      </div>

      <Avatar
        name={avatarName ?? admin.name}
        src={avatarSrc ?? admin.avatar}
      />
    </header>
  );
}



