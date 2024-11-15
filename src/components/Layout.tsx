// import React from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import {
  ClipboardList,
  BarChart3,
  Users,
  Settings,
  LogOut,
  UserCog,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export function Layout() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <nav className='bg-white shadow-sm'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between h-16'>
            <div className='flex'>
              <div className='flex-shrink-0 flex items-center'>
                <img
                  src='https://via.placeholder.com/40x40.png?text=Logo'
                  alt='Company Logo'
                  className='h-8 w-auto'
                />
              </div>
              <div className='hidden sm:ml-6 sm:flex sm:space-x-8'>
                <Link
                  to='/'
                  className='inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900'>
                  <ClipboardList className='mr-2 h-4 w-4' />
                  Payroll Entry
                </Link>
                <Link
                  to='/reports'
                  className='inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900'>
                  <BarChart3 className='mr-2 h-4 w-4' />
                  Reports
                </Link>
                <Link
                  to='/employee-portal'
                  className='inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900'>
                  <Users className='mr-2 h-4 w-4' />
                  Employee Portal
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    to='/users'
                    className='inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900'>
                    <UserCog className='mr-2 h-4 w-4' />
                    User Management
                  </Link>
                )}
              </div>
            </div>
            <div className='flex items-center space-x-4'>
              <Link
                to='/change-password'
                className='inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900'>
                <Settings className='mr-2 h-4 w-4' />
                Change Password
              </Link>
              <button
                onClick={handleLogout}
                className='inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900'>
                <LogOut className='mr-2 h-4 w-4' />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <Outlet />
      </main>
    </div>
  )
}
