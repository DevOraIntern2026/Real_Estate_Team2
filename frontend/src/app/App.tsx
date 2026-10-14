import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ForgotPasswordPage from '@/features/auth/pages/forgot-password/ForgotPasswordPage'
import EmailVerificationPage from '@/features/auth/pages/email-verification/EmailVerificationPage'
import LoginPage from '@/features/auth/pages/login/LoginPage'
import ResetPasswordPage from '@/features/auth/pages/reset-password/ResetPasswordPage'
import SignUpPage from '@/features/auth/pages/sign-up/SignUpPage'
import VerifyOtpPage from '@/features/auth/pages/verify-otp/VerifyOtpPage'
import LandingPage from '@/features/landing/pages/LandingPage'
import CustomerHomePage from '@/features/customer/pages/CustomerHomePage'
import SearchPage from '@/features/search/pages/SearchPage'
import { getAuthSession } from '@/services/api/tokenStorage'
import MainLayout from '@/components/layout/MainLayout'
import UsersLayout from '@/components/layout/UsersLayout'
import { AdminProvider } from '@/features/dashboard/context/AdminContext'
import { NotificationsProvider } from '@/features/dashboard/context/NotificationsContext'
import { PropertiesProvider } from '@/features/dashboard/context/PropertiesContext'
import ListingDetails from '@/features/dashboard/Pages/listing-details/ListingDetails'
import Listing from '@/features/dashboard/Pages/Listing/Listing'
import Notifications from '@/features/dashboard/Pages/Notification/Notifications'
import Overview from '@/features/dashboard/Pages/Overview/Overview'
import Profile from '@/features/dashboard/Pages/Profile/Profile'
import Reports from '@/features/dashboard/Pages/Reports/Reports'
import UserProfile from '@/features/dashboard/Pages/Users/UserProfile'
import Users from '@/features/dashboard/Pages/Users/Users'
import { UsersProvider } from '@/features/dashboard/Pages/Users/UsersContext'
import OwnerLayout from '@/components/layout/OwnerLayout'
import { ADMIN_PATHS, OWNER_PATH } from '@/features/dashboard/constants/paths'
import OwnerProviders from '@/features/dashboard/routes/OwnerProviders'
import OwnerInquiries from '@/features/dashboard/Pages/owner/inquiries/OwnerInquiries'
import OwnerOverview from '@/features/dashboard/Pages/owner/overview/OwnerOverview'
import OwnerReports from '@/features/dashboard/Pages/owner/reports/OwnerReports'
import OwnerNotifications from '@/features/dashboard/Pages/Notification/Notifications'
import NotFoundPage from './NotFoundPage'
import InquiryReply from '@/features/dashboard/Pages/owner/inquiries/InquiryReply'

function CustomerHomeRoute() {
  const session = getAuthSession()

  if (!session) return <Navigate replace to="/login" />
  if (session.role !== 'customer') return <Navigate replace to="/" />

  return <CustomerHomePage />
}

function CustomerSearchRoute() {
  const session = getAuthSession()

  if (!session) return <Navigate replace to="/login" />
  if (session.role !== 'customer') return <Navigate replace to="/" />

  return <SearchPage authenticated />
}

function App() {
  return (
    <BrowserRouter>
      <AdminProvider>
        <PropertiesProvider>
          <NotificationsProvider>
            <UsersProvider>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/customer-home" element={<CustomerHomeRoute />} />
                <Route path="/search" element={<SearchPage authenticated={false} />} />
                <Route path="/customer-search" element={<CustomerSearchRoute />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/verify-email" element={<EmailVerificationPage />} />
                <Route path="/verify-otp" element={<VerifyOtpPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path={ADMIN_PATHS.home} element={<MainLayout />}>
                  <Route index element={<Overview />} />
                  <Route path="listing">
                    <Route index element={<Listing />} />
                    <Route path=":listingId" element={<ListingDetails />} />
                  </Route>
                  <Route path="users" element={<UsersLayout />}>
                    <Route index element={<Users />} />
                    <Route path=":userId" element={<UserProfile />} />
                  </Route>
                  <Route path="notification" element={<Notifications />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="profile" element={<Profile />} />
                </Route>
                <Route path={OWNER_PATH} element={<OwnerProviders />}>
                  <Route element={<OwnerLayout />}>
                    <Route index element={<OwnerOverview />} />
                    <Route path="inquiries" element={<OwnerInquiries />} >
                      <Route index element={<OwnerInquiries/>} />
                      <Route path=':inquiryId' element={<InquiryReply/>} />
                    </Route>
                    <Route path="notifications" element={<OwnerNotifications canClear={false} />} />
                    <Route path="reports" element={<OwnerReports />} />
                  </Route>
                </Route>
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </UsersProvider>
          </NotificationsProvider>
        </PropertiesProvider>
      </AdminProvider>
    </BrowserRouter>
  )
}

export default App;
