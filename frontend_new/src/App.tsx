import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import './styles/global.css'

// Pages
import Home from './pages/Home'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'

// Organization Pages
import KYCInvitationManagement from './pages/KYCInvitationManagement'
import KYCSubmissionsManagement from './pages/KYCSubmissionsManagement'

// Customer Pages
import CustomerKYCInvitation from './pages/CustomerKYCInvitation'
import CustomerKYCProcess from './pages/CustomerKYCProcess'

// KYC Flow Pages (used by both org and customer)
import Welcome from './pages/Welcome'
import UserInfo from './pages/UserInfo'
import PhoneVerification from './pages/PhoneVerification'
import DocumentSelection from './pages/DocumentSelection'
import DocumentCapture from './pages/DocumentCapture'
import DocumentReview from './pages/DocumentReview'
import SelfieCapture from './pages/SelfieCapture'
import LivenessCheck from './pages/LivenessCheck'
import GPSCheck from './pages/GPSCheck'
import RiskSummary from './pages/RiskSummary'
import ResultPage from './pages/ResultPage'

// Layout
import Layout from './components/Layout'

// Protected Route Component
const ProtectedRoute: React.FC<{ element: React.ReactNode }> = ({ element }) => {
  const { user } = useAuthStore()
  return user ? <>{element}</> : <Navigate to="/auth" replace />
}

// Fallback Error Page
const ErrorFallback: React.FC = () => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg)',
    color: 'var(--text)',
    flexDirection: 'column',
    gap: '1rem',
  }}>
    <h1>Error Loading Page</h1>
    <p style={{ color: 'var(--text-secondary)' }}>The page could not be loaded.</p>
    <a href="/" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Return to Home</a>
  </div>
)

function App() {
  const { darkMode, resumeSession } = useAuthStore()
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    try {
      resumeSession()
      setInitialized(true)
      if (darkMode) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    } catch (error) {
      console.error('Error during initialization:', error)
      setInitialized(true) // Still allow app to render even if resumeSession fails
    }
  }, [darkMode, resumeSession])

  if (!initialized) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid var(--bg-tertiary)',
          borderTop: '4px solid var(--primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* ========== PUBLIC ROUTES (No Auth Required) ========== */}
        
        {/* Home Page */}
        <Route path="/" element={<Home />} />
        
        {/* Auth Pages */}
        <Route path="/auth" element={<Auth />} />

        {/* CUSTOMER-FACING ROUTES (No Auth) */}
        {/* Landing page when customer opens invitation link */}
        <Route path="/kyc/invite/:code" element={<CustomerKYCInvitation />} />

        {/* Customer KYC flow with organization branding */}
        <Route path="/kyc/process/:invitationCode/*" element={<CustomerKYCProcess />} />

        {/* ========== PROTECTED ROUTES (Auth Required) ========== */}

        {/* Organization Dashboard */}
        <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />

        {/* Organization - Manage KYC Invitation Links */}
        <Route
          path="/dashboard/invitations"
          element={<ProtectedRoute element={<KYCInvitationManagement />} />}
        />

        {/* Organization - Review Customer Submissions */}
        <Route
          path="/dashboard/submissions"
          element={<ProtectedRoute element={<KYCSubmissionsManagement />} />}
        />

        {/* Organization-initiated KYC Flow (for internal use) */}
        <Route element={<Layout />}>
          <Route path="/welcome" element={<ProtectedRoute element={<Welcome />} />} />
          <Route path="/user-info" element={<ProtectedRoute element={<UserInfo />} />} />
          <Route path="/verify-phone" element={<ProtectedRoute element={<PhoneVerification />} />} />
          <Route path="/select-document" element={<ProtectedRoute element={<DocumentSelection />} />} />
          <Route path="/capture-doc" element={<ProtectedRoute element={<DocumentCapture />} />} />
          <Route path="/review-doc" element={<ProtectedRoute element={<DocumentReview />} />} />
          <Route path="/selfie" element={<ProtectedRoute element={<SelfieCapture />} />} />
          <Route path="/liveness-check" element={<ProtectedRoute element={<LivenessCheck />} />} />
          <Route path="/gps-check" element={<ProtectedRoute element={<GPSCheck />} />} />
          <Route path="/summary" element={<ProtectedRoute element={<RiskSummary />} />} />
          <Route path="/result" element={<ProtectedRoute element={<ResultPage />} />} />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<ErrorFallback />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
