import { Outlet } from "react-router-dom";
import SideBar from "../../features/admin/components/SideBar/SideBar";

export default function MainLayout() {
  return <>
    <div className="min-h-screen bg-[#FFFAF5]">
  <SideBar />
  <main className="pt-14 md:ms-80 md:pt-0">
    <Outlet />
  </main>
</div>
  </>
}
