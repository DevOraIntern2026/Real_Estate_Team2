import MainLayout from "@/components/layout/MainLayout";
import UsersLayout from "@/components/layout/UsersLayout";
import { AdminProvider } from "@/features/admin/context/AdminContext";
import { NotificationsProvider } from "@/features/admin/context/NotificationsContext";
import { PropertiesProvider } from "@/features/admin/context/PropertiesContext";
import ListingDetails from "@/features/admin/Pages/listing-details/ListingDetails";
import Listing from "@/features/admin/Pages/Listing/Listing";
import Notifications from "@/features/admin/Pages/Notification/Notification";
import Overview from "@/features/admin/Pages/Overview/Overview";
import Profile from "@/features/admin/Pages/Profile/Profile";
import Reports from "@/features/admin/Pages/Reports/Reports";
import UserProfile from "@/features/admin/Pages/Users/UserProfile";
import Users from "@/features/admin/Pages/Users/Users";
import { UsersProvider } from "@/features/admin/Pages/Users/UsersContext";
import { createBrowserRouter, RouterProvider } from "react-router-dom";


const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Overview /> },
      {
        path: "listing",
        children: [
          { index: true, element: <Listing /> },
          { path: ":listingId", element: <ListingDetails /> },
        ],
      },
      {
        path: "users",
        element: <UsersLayout />,
        children: [
          { index: true, element: <Users /> },
          { path: ":userId", element: <UserProfile /> },
        ],
      },
      { path: "notification", element: <Notifications /> },
      { path: "reports", element: <Reports /> },
      { path: "profile", element: <Profile/> },
    ],
  },
]);

function App() {
  return (
    <>
    <AdminProvider>
    <PropertiesProvider>
      <NotificationsProvider>
        <UsersProvider>
          <RouterProvider router={router}></RouterProvider>
        </UsersProvider>
      </NotificationsProvider>
    </PropertiesProvider>
    </AdminProvider>
    </>
  );
}

export default App;
