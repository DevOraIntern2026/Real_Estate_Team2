import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from '@/features/auth/pages/login/LoginPage'
import SignUpPage from '@/features/auth/pages/sign-up/SignUpPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Navigate replace to="/signup" />} path="/" />
        <Route element={<LoginPage />} path="/login" />
        <Route element={<SignUpPage />} path="/signup" />
      </Routes>
    </BrowserRouter>
  )
}

export default App
