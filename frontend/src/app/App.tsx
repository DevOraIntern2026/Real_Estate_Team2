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
import { AdminProvider } from '@/features/admin/context/AdminContext'
import { NotificationsProvider } from '@/features/admin/context/NotificationsContext'
import { PropertiesProvider } from '@/features/admin/context/PropertiesContext'
import ListingDetails from '@/features/admin/Pages/listing-details/ListingDetails'
import Listing from '@/features/admin/Pages/Listing/Listing'
import Notifications from '@/features/admin/Pages/Notification/Notification'
import Overview from '@/features/admin/Pages/Overview/Overview'
import Profile from '@/features/admin/Pages/Profile/Profile'
import Reports from '@/features/admin/Pages/Reports/Reports'
import UserProfile from '@/features/admin/Pages/Users/UserProfile'
import Users from '@/features/admin/Pages/Users/Users'
import { UsersProvider } from '@/features/admin/Pages/Users/UsersContext'
import ErrorPage from '@/features/errors/ErrorPage'

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

function HashScrollHandler() {
  const { hash, pathname } = useLocation()

  useEffect(() => {
    if (!hash) return

    const frame = window.requestAnimationFrame(() => {
      document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [hash, pathname])

  return null
}

function App() {
  return (
    <BrowserRouter>
      <HashScrollHandler />
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
                <Route path="/error/401" element={<ErrorPage code={401} />} />
                <Route path="/error/403" element={<ErrorPage code={403} />} />
                <Route path="/admin" element={<MainLayout />}>
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
                <Route path="*" element={<ErrorPage code={404} />} />
              </Routes>
            </UsersProvider>
          </NotificationsProvider>
        </PropertiesProvider>
      </AdminProvider>
    </BrowserRouter>
  )
}

export default App;
