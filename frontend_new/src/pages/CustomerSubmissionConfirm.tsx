import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { invitationService } from '../services/invitations'
import type { KYCInvitation, CustomerSubmission } from '../types'
import { CheckCircle, Copy, Mail } from 'lucide-react'

/**
 * CUSTOMER-FACING SUBMISSION CONFIRMATION PAGE
 * Shown after customer completes KYC
 * Shows submission status and next steps
 */
interface CustomerSubmissionConfirmProps {
  invitation: KYCInvitation
}

const CustomerSubmissionConfirm: React.FC<CustomerSubmissionConfirmProps> = ({ invitation }) => {
  const navigate = useNavigate()
  const { session } = useAuthStore()
  const [submission, setSubmission] = useState<CustomerSubmission | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const submitKYC = async () => {
      if (!session) {
        setLoading(false)
        return
      }

      try {
        // Submit the KYC session with invitation code (from parent route)
        // For now, we'll generate a mock submission ID since backend submission endpoint needs invitation code
        const mockSub: CustomerSubmission = {
          id: 'sub_' + Date.now(),
          kycSessionId: 'session_' + Date.now(),
          organizationId: invitation.organizationId,
          invitationId: invitation.id,
          status: 'submitted',
          submittedAt: new Date(),
        }
        setSubmission(mockSub)
        setLoading(false)
      } catch (err) {
        console.error('Failed to submit KYC', err)
        setLoading(false)
      }
    }

    submitKYC()
  }, [session, invitation])

  const handleCopyEmail = () => {
    if (submission?.customerEmail) {
      navigator.clipboard.writeText(submission.customerEmail)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleStartOver = () => {
    navigate('/')
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid var(--border)',
            borderTop: '4px solid #2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem',
          }} />
          <p style={{ color: 'var(--text-secondary)' }}>Submitting your information...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{
        background: 'var(--bg-secondary)',
        borderRadius: '1rem',
        padding: '2rem',
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        {/* Success Icon */}
        <div style={{
          fontSize: '4rem',
          marginBottom: '1.5rem',
          animation: 'slideDown 0.6s ease-out',
        }}>
          ✓
        </div>

        {/* Main Message */}
        <h2 style={{
          marginBottom: '0.5rem',
          fontSize: '1.75rem',
          color: 'var(--text)',
        }}>
          Application Submitted Successfully!
        </h2>

        <p style={{
          color: 'var(--text-secondary)',
          marginBottom: '2rem',
          lineHeight: '1.6',
          fontSize: '0.95rem',
        }}>
          Thank you for completing the identity verification process. Your application has been received and is now being reviewed.
        </p>

        {/* Status Box */}
        <div style={{
          background: 'var(--bg)',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          marginBottom: '2rem',
          border: '2px solid #22c55e',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            marginBottom: '1rem',
          }}>
            <CheckCircle size={24} style={{ color: '#22c55e' }} />
            <span style={{ fontWeight: 600, color: 'var(--text)' }}>Status: Submitted</span>
          </div>

          <div style={{
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            lineHeight: '1.8',
          }}>
            <p style={{ margin: '0.5rem 0' }}>
              <strong>Submission ID:</strong> {submission?.id}
            </p>
            <p style={{ margin: '0.5rem 0' }}>
              <strong>Submitted at:</strong> {submission?.submittedAt?.toLocaleDateString()}
            </p>
            {submission?.customerEmail && (
              <p style={{ margin: '0.5rem 0' }}>
                <strong>Email on file:</strong> {submission.customerEmail}
              </p>
            )}
          </div>
        </div>

        {/* Next Steps */}
        <div style={{
          background: 'rgba(59, 130, 246, 0.1)',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          marginBottom: '2rem',
          border: '1px solid rgba(59, 130, 246, 0.2)',
        }}>
          <h3 style={{
            marginBottom: '1rem',
            fontSize: '1rem',
            fontWeight: 600,
            color: 'var(--text)',
          }}>
            What Happens Next?
          </h3>

          <ol style={{
            margin: 0,
            padding: '0 0 0 1.25rem',
            fontSize: '0.9rem',
            color: 'var(--text-secondary)',
            lineHeight: '1.8',
            textAlign: 'left',
          }}>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>{invitation.customBranding?.companyName}</strong> will review your application
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              We'll verify your identity and documents
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              You'll receive an email update on your status
            </li>
            <li>
              The entire process typically takes 1-3 business days
            </li>
          </ol>
        </div>

        {/* Contact Information */}
        <div style={{
          background: 'var(--bg)',
          borderRadius: '0.75rem',
          padding: '1rem',
          marginBottom: '2rem',
          fontSize: '0.875rem',
        }}>
          <p style={{
            color: 'var(--text-secondary)',
            margin: '0 0 0.75rem 0',
          }}>
            Questions? Contact {invitation.customBranding?.companyName}:
          </p>
          <p style={{
            color: 'var(--text)',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
          }}>
            <Mail size={16} />
            <a
              href={`mailto:${invitation.customBranding?.companyName}@example.com`}
              style={{
                color: 'var(--primary)',
                textDecoration: 'none',
              }}
            >
              support@{invitation.customBranding?.companyName?.toLowerCase().replace(/\s+/g, '')}
              .com
            </a>
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={handleStartOver}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: 'var(--bg)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontWeight: 600,
            marginBottom: '1rem',
          }}
        >
          Return to Home
        </button>

        {/* Privacy Notice */}
        <p style={{
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          margin: 0,
          lineHeight: '1.5',
        }}>
          Your information is securely encrypted and stored. We take your privacy seriously and will never share your data with third parties without your consent.
        </p>
      </div>

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default CustomerSubmissionConfirm
