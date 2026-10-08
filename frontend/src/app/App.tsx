import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ForgotPasswordPage from '@/features/auth/pages/forgot-password/ForgotPasswordPage'
import EmailVerificationPage from '@/features/auth/pages/email-verification/EmailVerificationPage'
import LoginPage from '@/features/auth/pages/login/LoginPage'
import ResetPasswordPage from '@/features/auth/pages/reset-password/ResetPasswordPage'
import SignUpPage from '@/features/auth/pages/sign-up/SignUpPage'
import VerifyOtpPage from '@/features/auth/pages/verify-otp/VerifyOtpPage'
import LandingPage from '@/features/landing/pages/LandingPage'
import CustomerHomePage from '@/features/customer/pages/CustomerHomePage'
import { getAuthSession } from '@/services/api/tokenStorage'

function CustomerHomeRoute() {
  const session = getAuthSession()

  if (!session) return <Navigate replace to="/login" />
  if (session.role !== 'customer') return <Navigate replace to="/" />

  return <CustomerHomePage />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<LandingPage />} path="/" />
        <Route element={<CustomerHomeRoute />} path="/customer-home" />
        <Route element={<LoginPage />} path="/login" />
        <Route element={<ResetPasswordPage />} path="/reset-password" />
        <Route element={<ForgotPasswordPage />} path="/forgot-password" />
        <Route element={<EmailVerificationPage />} path="/verify-email" />
        <Route element={<VerifyOtpPage />} path="/verify-otp" />
        <Route element={<SignUpPage />} path="/signup" />
      </Routes>
    </BrowserRouter>
  )
}

export default App
