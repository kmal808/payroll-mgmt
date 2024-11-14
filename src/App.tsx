import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { LoginForm } from './components/auth/LoginForm'
import { RegisterForm } from './components/auth/RegisterForm'
import { ChangePasswordForm } from './components/auth/ChangePasswordForm'
import { PayrollForm } from './components/PayrollForm'
import { Reports } from './components/Reports'
import { EmployeePortal } from './components/EmployeePortal'
import { UserManagement } from './components/UserManagement'
import { useAuth } from './contexts/AuthContext'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <Navigate to='/login' />
  }

  return <>{children}</>
}

function App() {
  return (
    <Routes>
      <Route path='/login' element={<LoginForm />} />
      <Route path='/register' element={<RegisterForm />} />
      <Route
        path='/'
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }>
        <Route index element={<PayrollForm />} />
        <Route path='reports' element={<Reports />} />
        <Route path='employee-portal' element={<EmployeePortal />} />
        <Route path='users' element={<UserManagement />} />
        <Route path='change-password' element={<ChangePasswordForm />} />
      </Route>
    </Routes>
  )
}

export default App
