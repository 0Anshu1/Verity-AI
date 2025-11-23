import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useKYCStore } from '../store/kycStore'
import { invitationService } from '../services/invitations'
import type { KYCInvitation } from '../types'
import { LoadingSpinner, ProgressBar } from '../components'
import { Lock } from 'lucide-react'

// Import all KYC pages
import Welcome from './Welcome'
import UserInfo from './UserInfo'
import PhoneVerification from './PhoneVerification'
import DocumentSelection from './DocumentSelection'
import DocumentCapture from './DocumentCapture'
import DocumentReview from './DocumentReview'
import SelfieCapture from './SelfieCapture'
import LivenessCheck from './LivenessCheck'
import GPSCheck from './GPSCheck'
import RiskSummary from './RiskSummary'
import ResultPage from './ResultPage'
import CustomerSubmissionConfirm from './CustomerSubmissionConfirm'

/**
 * CUSTOMER-FACING KYC PROCESS WRAPPER
 * Wraps the entire KYC flow with organization branding
 * Route: /kyc/process/{invitationCode}
 * No authentication required
 */
const CustomerKYCProcess: React.FC = () => {
  const { invitationCode } = useParams<{ invitationCode: string }>()
  const { session } = useAuthStore()
  const { currentStep } = useKYCStore()
  
  const [invitation, setInvitation] = useState<KYCInvitation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadInvitation = async () => {
      if (!invitationCode) {
        setError('Invalid invitation code')
        setLoading(false)
        return
      }

      try {
        const inv = await invitationService.getInvitationByCode(invitationCode)
        if (!inv) {
          setError('This invitation link is invalid or expired')
          setLoading(false)
          return
        }

        setInvitation(inv)
        setLoading(false)
      } catch (err) {
        setError('Failed to load invitation details')
        setLoading(false)
      }
    }

    loadInvitation()
  }, [invitationCode])

  if (loading) return <LoadingSpinner />

  if (error || !invitation) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
      }}>
        <div style={{
          textAlign: 'center',
          color: 'var(--text)',
        }}>
          <h2 style={{ marginBottom: '1rem' }}>Error Loading KYC Process</h2>
          <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Organization Branding Header */}
      <header style={{
        background: invitation.customBranding?.primaryColor || '#2563eb',
        color: 'white',
        padding: '1rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {invitation.customBranding?.logoUrl && (
            <img
              src={invitation.customBranding.logoUrl}
              alt={invitation.customBranding.companyName}
              style={{
                height: '40px',
                maxWidth: '150px',
              }}
            />
          )}
          <span style={{ fontSize: '0.875rem', opacity: 0.9 }}>
            {invitation.customBranding?.companyName} — Identity Verification
          </span>
        </div>

        {/* Trust badge */}
        <div style={{
          fontSize: '0.85rem',
          opacity: 0.9,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <Lock size={16} />
          <span>Secure & Encrypted</span>
        </div>
      </header>

      {/* Progress */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)' }}>
        <ProgressBar currentStep={currentStep} totalSteps={10} />
      </div>

      {/* KYC Flow Routes */}
      <main style={{ flex: 1, padding: '1rem' }}>
        <Routes>
          {/* All standard KYC pages work as before, but in customer context */}
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/user-info" element={<UserInfo />} />
          <Route path="/verify-phone" element={<PhoneVerification />} />
          <Route path="/select-document" element={<DocumentSelection />} />
          <Route path="/capture-doc" element={<DocumentCapture />} />
          <Route path="/review-doc" element={<DocumentReview />} />
          <Route path="/selfie" element={<SelfieCapture />} />
          <Route path="/liveness-check" element={<LivenessCheck />} />
          <Route path="/gps-check" element={<GPSCheck />} />
          <Route path="/summary" element={<RiskSummary />} />
          <Route path="/result" element={<ResultPage />} />
          <Route path="/confirm" element={<CustomerSubmissionConfirm invitation={invitation} />} />
          
          {/* Default redirect */}
          <Route path="*" element={<Navigate to="./welcome" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer style={{
        background: 'var(--bg-secondary)',
        color: 'var(--text-secondary)',
        padding: '1.5rem',
        textAlign: 'center',
        fontSize: '0.75rem',
        borderTop: '1px solid var(--border)',
      }}>
        <p style={{ margin: 0 }}>
          Powered by Verity AI | Your information is secure and encrypted | 
          <a href="#" style={{ color: 'var(--primary)', marginLeft: '0.5rem', textDecoration: 'none' }}>
            Privacy Policy
          </a>
        </p>
      </footer>
    </div>
  )
}

export default CustomerKYCProcess
