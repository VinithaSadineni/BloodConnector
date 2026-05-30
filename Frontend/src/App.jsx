import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { AnimatePresence } from 'framer-motion'
import { useAuthStore } from './store/authStore'
import { useNotificationStore } from './store/notificationStore'
import { useSocketStore } from './store/socketStore'
import { ProtectedRoute } from './routes/ProtectedRoute'

// Public Pages
import LandingPage from './pages/public/LandingPage'
import LoginPage from './pages/public/LoginPage'
import SignupPage from './pages/public/SignupPage'
import NotFoundPage from './pages/public/NotFoundPage'

// Seeker Pages
import SeekerDashboard from './pages/seeker/SeekerDashboard'
import CreateRequest from './pages/seeker/CreateRequest'
import MyRequests from './pages/seeker/MyRequests'
import RequestDetail from './pages/seeker/RequestDetail'
import SeekerProfile from './pages/seeker/SeekerProfile'

// Donor Pages
import DonorDashboard from './pages/donor/DonorDashboard'
import DonorProfile from './pages/donor/DonorProfile'
import NearbyRequests from './pages/donor/NearbyRequests'
import DonationHistory from './pages/donor/DonationHistory'

// Hospital Pages
import HospitalDashboard from './pages/hospital/HospitalDashboard'
import HospitalProfile from './pages/hospital/HospitalProfile'
import BloodStockManager from './pages/hospital/BloodStockManager'
import IncomingRequests from './pages/hospital/IncomingRequests'

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard'
import UserManagement from './pages/admin/UserManagement'
import RequestMonitor from './pages/admin/RequestMonitor'
import VerificationQueue from './pages/admin/VerificationQueue'
import Analytics from './pages/admin/Analytics'

function App() {
  const { token, user, isAuthenticated, fetchMe } = useAuthStore()
  const { connect, disconnect } = useSocketStore()
  const { fetchNotifications } = useNotificationStore()

  // Rehydrate auth and connect socket on app load
  useEffect(() => {
    const init = async () => {
      if (token && isAuthenticated) {
        try {
          // Fetch full user profile
          const profile = await fetchMe()
          if (profile) {
            // Connect socket with auth and pass the full user profile
            connect(token, profile || user)
            // Fetch notifications
            fetchNotifications()
          }
        } catch (err) {
          console.error('Failed to rehydrate auth:', err)
        }
      }
    }

    init()

    // Cleanup on unmount
    return () => {
      disconnect()
    }
  }, [token, isAuthenticated, fetchMe, connect, disconnect, fetchNotifications])

  return (
    <>
      <BrowserRouter>
        <AnimatePresence mode="wait">
          <Routes>
            {/* PUBLIC ROUTES */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* SEEKER ROUTES */}
            <Route
              path="/seeker/dashboard"
              element={
                <ProtectedRoute requiredRoles={['seeker']}>
                  <SeekerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/seeker/requests"
              element={
                <ProtectedRoute requiredRoles={['seeker']}>
                  <MyRequests />
                </ProtectedRoute>
              }
            />
            <Route
              path="/seeker/requests/new"
              element={
                <ProtectedRoute requiredRoles={['seeker']}>
                  <CreateRequest />
                </ProtectedRoute>
              }
            />
            <Route
              path="/seeker/requests/:id"
              element={
                <ProtectedRoute requiredRoles={['seeker']}>
                  <RequestDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/seeker/profile"
              element={
                <ProtectedRoute requiredRoles={['seeker']}>
                  <SeekerProfile />
                </ProtectedRoute>
              }
            />

            {/* DONOR ROUTES */}
            <Route
              path="/donor/dashboard"
              element={
                <ProtectedRoute requiredRoles={['donor']}>
                  <DonorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/donor/profile"
              element={
                <ProtectedRoute requiredRoles={['donor']}>
                  <DonorProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/donor/nearby"
              element={
                <ProtectedRoute requiredRoles={['donor']}>
                  <NearbyRequests />
                </ProtectedRoute>
              }
            />
            <Route
              path="/donor/history"
              element={
                <ProtectedRoute requiredRoles={['donor']}>
                  <DonationHistory />
                </ProtectedRoute>
              }
            />

            {/* HOSPITAL ROUTES */}
            <Route
              path="/hospital/dashboard"
              element={
                <ProtectedRoute requiredRoles={['hospital']}>
                  <HospitalDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hospital/profile"
              element={
                <ProtectedRoute requiredRoles={['hospital']}>
                  <HospitalProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hospital/stock"
              element={
                <ProtectedRoute requiredRoles={['hospital']}>
                  <BloodStockManager />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hospital/requests"
              element={
                <ProtectedRoute requiredRoles={['hospital']}>
                  <IncomingRequests />
                </ProtectedRoute>
              }
            />

            {/* ADMIN ROUTES */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute requiredRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute requiredRoles={['admin']}>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/requests"
              element={
                <ProtectedRoute requiredRoles={['admin']}>
                  <RequestMonitor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/verify"
              element={
                <ProtectedRoute requiredRoles={['admin']}>
                  <VerificationQueue />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute requiredRoles={['admin']}>
                  <Analytics />
                </ProtectedRoute>
              }
            />

            {/* 404 ROUTE */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AnimatePresence>
      </BrowserRouter>

      {/* Toast Notification Container */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#111827',
            color: '#F0F4F8',
            border: '1px solid #1F2D3D',
            borderRadius: '8px',
            backdropFilter: 'blur(12px)',
          },
        }}
      />
    </>
  )
}

export default App
