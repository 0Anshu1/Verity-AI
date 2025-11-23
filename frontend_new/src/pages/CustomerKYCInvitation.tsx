import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { invitationService } from '../services/invitations'
import { useAuthStore } from '../store/authStore'
import { LoadingSpinner, Card } from '../components'
import type { KYCInvitation } from '../types'
import { CheckCircle, XCircle } from 'lucide-react'

/**
 * CUSTOMER-FACING PAGE
 * No authentication required
 * Customer lands here from invitation link: /kyc/invite/{code}
 */
const CustomerKYCInvitation: React.FC = () => {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const { createSession } = useAuthStore()
  
  const [invitation, setInvitation] = useState<KYCInvitation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const fetchInvitation = async () => {
      if (!code) {
        setError('Invalid invitation link')
        setLoading(false)
        return
      }

      try {
        const inv = await invitationService.getInvitationByCode(code)
        if (!inv) {
          setError('This invitation link is invalid or has expired')
          setLoading(false)
          return
        }

        setInvitation(inv)
        setLoading(false)
      } catch (err) {
        setError('Failed to load invitation')
        setLoading(false)
      }
    }

    fetchInvitation()
  }, [code])

  const handleStartKYC = async () => {
    if (!invitation) return

    try {
      // Create KYC session linked to this invitation
      createSession()
      setStarted(true)
      
      // Redirect to KYC flow with invitation context
      navigate(`/kyc/process/${invitation.code}`)
    } catch (err) {
      setError('Failed to start KYC process')
    }
  }

  if (loading) return <LoadingSpinner />

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}>
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: '1rem',
          padding: '2rem',
          maxWidth: '400px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-md)'
        }}>
          <XCircle size={48} style={{ color: 'var(--error)', margin: '0 auto 1rem' }} />
          <h2 style={{ marginBottom: '1rem', color: 'var(--text)' }}>Invalid Invitation</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{error}</p>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              padding: '0.6rem 1rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  if (!invitation) return <LoadingSpinner />

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Organization Branding Header */}
      <header style={{
        background: 'var(--bg-secondary)',
        color: 'var(--text)',
        padding: '1.25rem 1.5rem',
        textAlign: 'center',
        borderBottom: '1px solid var(--border)'
      }}>
        {invitation.customBranding?.logoUrl && (
          <img
            src={invitation.customBranding.logoUrl}
            alt={invitation.customBranding.companyName}
            style={{ height: '40px', marginBottom: '0.5rem' }}
          />
        )}
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>
          {invitation.customBranding?.companyName || 'Verity AI'}
        </h1>
        <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Identity Verification</p>
      </header>

      {/* Main Content */}
      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}>
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: '1rem',
          padding: '2rem',
          maxWidth: '600px',
          width: '100%',
        }}>
          {/* Welcome Message */}
          <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
            <div style={{
              marginBottom: '0.75rem',
            }}>
              <CheckCircle size={48} color="var(--success)" />
            </div>
            <h2 style={{
              marginBottom: '0.5rem',
              fontSize: '1.25rem',
              color: 'var(--text)',
            }}>
              {invitation.name || 'Complete Your Identity Verification'}
            </h2>
            <p style={{
              color: 'var(--text-secondary)',
              marginBottom: '1.25rem',
              lineHeight: '1.6',
            }}>
              {invitation.customBranding?.companyName} has requested you to complete identity verification using our secure KYC process. This usually takes about 5-10 minutes.
            </p>
          </div>

          {/* Requirements */}
          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: '0.75rem',
            padding: '1.25rem',
            marginBottom: '1.5rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <h3 style={{
              marginBottom: '1rem',
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--text)',
            }}>
              What You'll Need
            </h3>
            <ul style={{
              margin: 0,
              padding: 0,
              listStyle: 'none',
            }}>
              {invitation.requiredDocuments?.map((doc) => (
                <li
                  key={doc}
                  style={{
                    padding: '0.5rem 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <CheckCircle size={18} style={{ color: '#22c55e' }} />
                  <span style={{ textTransform: 'capitalize' }}>
                    {doc === 'aadhar' ? 'Aadhar Card' : doc === 'license' ? 'Driver License' : doc.charAt(0).toUpperCase() + doc.slice(1)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Process Steps */}
          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: '0.75rem',
            padding: '1.25rem',
            marginBottom: '1.5rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <h3 style={{
              marginBottom: '1rem',
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--text)',
            }}>
              The Process
            </h3>
            <ol style={{
              margin: 0,
              padding: '0 0 0 1.5rem',
              color: 'var(--text-secondary)',
              lineHeight: '2',
            }}>
              <li>Provide your personal information</li>
              <li>Verify your phone number with OTP</li>
              <li>Upload a photo of your identity document</li>
              <li>Take a selfie for liveness verification</li>
              <li>Verify your location (if required)</li>
              <li>Review and submit your application</li>
            </ol>
          </div>

          {/* Call to Action */}
          <button
            onClick={handleStartKYC}
            disabled={started}
            style={{
              width: '100%',
              padding: '0.85rem',
              background: started ? 'var(--bg-tertiary)' : 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: 600,
              fontSize: '0.98rem',
              cursor: started ? 'not-allowed' : 'pointer',
              transition: 'background 0.3s',
            }}
          >
            {started ? 'Starting Process...' : 'Start Identity Verification'}
          </button>

          {/* Privacy Notice */}
          <p style={{
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            textAlign: 'center',
            marginTop: '1rem',
            lineHeight: '1.45',
          }}>
            Your information is securely encrypted and will only be used for identity verification purposes by {invitation.customBranding?.companyName}.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        background: 'transparent',
        color: 'var(--text-secondary)',
        padding: '1rem',
        textAlign: 'center',
        fontSize: '0.85rem',
      }}>
        © 2025 Verity AI. All rights reserved.
      </footer>
    </div>
  )
}

export default CustomerKYCInvitation
