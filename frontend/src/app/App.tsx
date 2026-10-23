import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'

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
import OwnerLayout from '@/components/layout/OwnerLayout'
import { AdminProvider } from '@/features/dashboard/context/AdminContext'
import { NotificationsProvider } from '@/features/dashboard/context/NotificationsContext'
import { PropertiesProvider } from '@/features/dashboard/context/PropertiesContext'
import { UsersProvider } from '@/features/dashboard/Pages/Users/UsersContext'
import { ADMIN_PATHS, OWNER_PATH } from '@/features/dashboard/constants/paths'
import OwnerProviders from '@/features/dashboard/routes/OwnerProviders'
import OwnerInquiries from '@/features/dashboard/Pages/owner/inquiries/OwnerInquiries'
import OwnerOverview from '@/features/dashboard/Pages/owner/overview/OwnerOverview'
import OwnerReports from '@/features/dashboard/Pages/owner/reports/OwnerReports'
import OwnerNotifications from '@/features/dashboard/Pages/Notification/Notifications'
import InquiryReply from '@/features/dashboard/Pages/owner/inquiries/InquiryReply'
import AdminOverview from '@/features/dashboard/Pages/Overview/AdminOverview'
import ListingDetails from '@/features/dashboard/Pages/listing-details/ListingDetails'
import Listing from '@/features/dashboard/Pages/Listing/Listing'
import Notifications from '@/features/dashboard/Pages/Notification/Notifications'
import Profile from '@/features/dashboard/Pages/Profile/Profile'
import Reports from '@/features/dashboard/Pages/Reports/Reports'
import UserProfile from '@/features/dashboard/Pages/Users/UserProfile'
import Users from '@/features/dashboard/Pages/Users/Users'
import ErrorPage from '@/features/errors/ErrorPage'
import NotFoundPage from './NotFoundPage'
import PropertyDetails from '@/features/properties/page/PropertyDetails'
import FavoritesPage from '@/features/favorites/page/FavoritesPage'
import ProfileSettingPage from '@/features/customer/pages/ProfileSettingPage'
import MyInquiriesPage from '@/features/customer/pages/MyInquiriesPage'
import CustomerNotificationsPage from '@/features/customer/pages/CustomerNotificationsPage'
import CustomerMessagesPage from '@/features/customer/pages/CustomerMessagesPage'
import { ProfileLayout } from '@/features/customer/components/ProfileLayout'
import MyProperties from '@/features/dashboard/Pages/owner/properties/MyProperties'

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

function CustomerMessageRoute() {
  const session = getAuthSession()

  if (!session) return <Navigate replace to="/login" />
  if (session.role !== 'customer') return <Navigate replace to="/" />

  return <CustomerMessagesPage />
}

function AdminDashboardRoute() {
  const session = getAuthSession()

  if (!session) return <Navigate replace to="/login" />
  if (session.role !== 'admin') return <Navigate replace to="/" />

  return (
    <AdminProvider>
      <PropertiesProvider>
        <NotificationsProvider>
          <UsersProvider>
            <MainLayout />
          </UsersProvider>
        </NotificationsProvider>
      </PropertiesProvider>
    </AdminProvider>
  )
}

function HashScrollHandler() {
  const { hash, pathname } = useLocation()

  useEffect(() => {
    if (!hash) return

    const frame = window.requestAnimationFrame(() => {
      document
        .getElementById(decodeURIComponent(hash.slice(1)))
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [hash, pathname])

  return null
}

function App() {
  return (
    <BrowserRouter>
      <HashScrollHandler />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route element={<ProfileLayout />}>
          <Route path="/profile/settings" element={<ProfileSettingPage />} />
          <Route path="/profile/inquiries" element={<MyInquiriesPage />} />
        </Route>
        <Route path="/property-details/:id" element={<PropertyDetails />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/customer-home" element={<CustomerHomeRoute />} />
        <Route path="/customer/messages/:chatId" element={<CustomerMessageRoute />} />
        <Route path="/notifications" element={<CustomerNotificationsPage />} />
        <Route path="/search" element={<SearchPage authenticated={false} />} />
        <Route path="/customer-search" element={<CustomerSearchRoute />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-email" element={<EmailVerificationPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        <Route path={ADMIN_PATHS.home} element={<AdminDashboardRoute />}>
          <Route index element={<AdminOverview />} />
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
            <Route path="properties">
      <Route index element={<MyProperties />} />
      <Route
        path=":propertyId"
        element={<PropertyDetails />}
      />
      {/* <Route
        path=":propertyId/edit"
        element={<ComingSoon title="Edit Property" />}
      /> */}
    </Route>
            <Route path="inquiries">
              <Route index element={<OwnerInquiries />} />
              <Route path=":inquiryId" element={<InquiryReply />} />
            </Route>
            
            <Route path="notifications" element={<OwnerNotifications canClear={false} />} />
            <Route path="reports" element={<OwnerReports />} />
          </Route>
        </Route>

        <Route path="/error/401" element={<ErrorPage code={401} />} />
        <Route path="/error/403" element={<ErrorPage code={403} />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
