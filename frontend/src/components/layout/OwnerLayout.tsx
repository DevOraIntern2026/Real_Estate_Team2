import { Outlet } from "react-router-dom";
import OwnerSidebar from "../../features/dashboard/components/layout/OwnerSidebar";

export default function OwnerLayout() {
  return (
    <div className="min-h-screen bg-[#FFFAF5]">
      <OwnerSidebar />
      {/* md:ms-80 = the sidebar width (w-80). pt-14 leaves room for the mobile menu button */}
      <main className="pt-14 md:ms-80 md:pt-0">
        <Outlet />
      </main>
    </div>
  );
}
