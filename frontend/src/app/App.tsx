import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ForgotPasswordPage from '@/features/auth/pages/forgot-password/ForgotPasswordPage'
import LoginPage from '@/features/auth/pages/login/LoginPage'
import SignUpPage from '@/features/auth/pages/sign-up/SignUpPage'
import VerifyOtpPage from '@/features/auth/pages/verify-otp/VerifyOtpPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Navigate replace to="/signup" />} path="/" />
        <Route element={<LoginPage />} path="/login" />
        <Route element={<ForgotPasswordPage />} path="/forgot-password" />
        <Route element={<VerifyOtpPage />} path="/verify-otp" />
        <Route element={<SignUpPage />} path="/signup" />
      </Routes>
    </BrowserRouter>
  )
}

export default App
