import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useKYCStore } from '../store/kycStore'
import { useAuthStore } from '../store/authStore'
import { Card, Badge } from '../components'
import { useI18n } from '../services/i18n'
import { voiceService, languageToVoiceCode } from '../services/voice'
import { Download, RotateCcw, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

const ResultPage: React.FC = () => {
  const navigate = useNavigate()
  const { session, clearSession, voiceGuidance, language } = useKYCStore()
  const { t } = useI18n()
  const { user } = useAuthStore()
  
  // If user is null, this is a customer-facing view (no auth = customer)
  const isCustomerView = !user

  const isApproved = session?.status === 'approved'
  const isRejected = session?.status === 'rejected'
  const isNeedsReview = session?.status === 'needs_review'

  const getStatusDisplay = () => {
    switch (session?.status) {
      case 'approved':
        return {
          icon: <CheckCircle size={60} color="var(--success)" />,
          title: t('result.approved'),
          subtitle: 'Your identity has been successfully verified',
          color: 'green',
        }
      case 'rejected':
        return {
          icon: <XCircle size={60} color="var(--error)" />,
          title: t('result.rejected'),
          subtitle: 'We were unable to verify your identity at this time',
          color: 'red',
        }
      default:
        return {
          icon: <AlertCircle size={60} color="var(--warning)" />,
          title: t('result.review'),
          subtitle: 'Your application is being manually reviewed',
          color: 'amber',
        }
    }
  }

  const status = getStatusDisplay()

  React.useEffect(() => {
    if (voiceGuidance && voiceService.isSupported()) {
      const code = languageToVoiceCode[language] || 'en-US'
      voiceService.speak(status.title, { language: code }).catch(() => {})
    }
  }, [])

  const reasons =
    session?.result?.reasons ||
    (isApproved
      ? [
          'Document authenticity verified',
          'Face match and liveness confirmed',
          'GPS location validated',
          'Low risk score achieved',
        ]
      : [
          'Document quality issues detected',
          'Face match score below threshold',
          'GPS location mismatch',
          'High risk factors identified',
        ])

  const recommendations = session?.result?.recommendations || []

  const handleDownloadReport = () => {
    const report = `
VERITY-AI KYC VERIFICATION REPORT
Generated: ${new Date().toISOString()}
Session ID: ${session?.id}

STATUS: ${session?.status?.toUpperCase()}

PERSONAL INFORMATION:
Name: ${session?.userInfo?.fullName || 'N/A'}
DOB: ${session?.userInfo?.dateOfBirth || 'N/A'}
Phone: ${session?.userInfo?.phone || 'N/A'}
Address: ${session?.userInfo?.address || 'N/A'}

VERIFICATION SCORES:
Document Authenticity: ${session?.riskAssessment?.documentAuthenticity?.toFixed(1)}%
Face Match: ${session?.riskAssessment?.faceMatchScore?.toFixed(1)}%
GPS Match: ${session?.riskAssessment?.gpsMatch?.toFixed(1)}%
Phone Verification: ${session?.riskAssessment?.phoneVerification?.toFixed(1)}%
Overall Risk Score: ${session?.riskAssessment?.systemRiskScore?.toFixed(1)}%

DECISION REASONS:
${reasons.map((r) => `- ${r}`).join('\n')}

RECOMMENDATIONS:
${recommendations.length > 0 ? recommendations.map((r) => `- ${r}`).join('\n') : 'None'}
    `.trim()

    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(report))
    element.setAttribute('download', `kyc-report-${session?.id}.txt`)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleStartNewKYC = () => {
    clearSession()
    navigate('/')
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <Card>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ marginBottom: '1rem' }}>{status.icon}</div>
          <h1 style={{ marginBottom: '0.5rem' }}>{status.title}</h1>
          <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)' }}>
            {status.subtitle}
          </p>
        </div>

        {/* Session Info */}
        <div
          style={{
            backgroundColor: 'var(--bg)',
            borderRadius: 'var(--radius-md)',
            padding: '1.5rem',
            marginBottom: '2rem',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                {t('session.id')}
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.875rem', wordBreak: 'break-all' }}>
                {session?.id}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                {t('session.status')}
              </div>
              <Badge
                text={session?.status?.toUpperCase() || 'UNKNOWN'}
                color={
                  isApproved ? 'success' : isRejected ? 'error' : 'warning'
                }
              />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
              {t('session.completedAt')}
            </div>
            <div>{session?.updatedAt ? new Date(session.updatedAt).toLocaleString() : 'N/A'}</div>
          </div>
        </div>

        {/* Reasons */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>
            {isApproved ? t('result.passed') : isRejected ? t('result.failed') : t('result.review')}
          </h3>
          <ul
            style={{
              listStyle: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            {reasons.map((reason, idx) => (
              <li
                key={idx}
                style={{
                  padding: '0.75rem',
                  backgroundColor: 'var(--bg)',
                  borderRadius: 'var(--radius-md)',
                  borderLeft: `4px solid ${isApproved ? 'var(--success)' : 'var(--error)'}`,
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'flex-start',
                }}
              >
                <div style={{ marginTop: '2px', color: isApproved ? 'var(--success)' : 'var(--error)', display: 'flex', alignItems: 'center' }}>
                  {isApproved ? <CheckCircle size={16} /> : <XCircle size={16} />}
                </div>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>{t('recommendations.title')}</h3>
            <ul
              style={{
                listStyle: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              {recommendations.map((rec, idx) => (
                <li
                  key={idx}
                  style={{
                    padding: '0.75rem',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    borderRadius: 'var(--radius-md)',
                    borderLeft: '4px solid var(--warning)',
                    display: 'flex',
                    gap: '0.75rem',
                  }}
                >
                  <span style={{ color: 'var(--warning)' }}>•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Risk Score Summary - Only show to organizations */}
        {!isCustomerView && (
          <div
            style={{
              backgroundColor: 'var(--bg)',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
              marginBottom: '2rem',
            }}
          >
            <h3 style={{ marginBottom: '1rem' }}>Risk Assessment Summary</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Overall Risk Score
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>
                  {session?.riskAssessment?.systemRiskScore?.toFixed(1)}%
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Risk Level
                </div>
                <Badge text={session?.riskAssessment?.riskLevel?.toUpperCase() || 'N/A'} color="primary" />
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {!isCustomerView && (
            <button onClick={handleDownloadReport} className="btn btn-secondary" style={{ width: '100%' }}>
              <Download size={20} style={{ marginRight: '0.5rem' }} />
              {t('result.download')}
            </button>
          )}
          {isCustomerView ? (
            <div style={{
              padding: '1.5rem',
              background: 'rgba(59, 130, 246, 0.1)',
              borderRadius: '0.5rem',
              marginBottom: '1rem',
              textAlign: 'center',
            }}>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                {t('risk.customer.message')}
              </p>
            </div>
          ) : (
            <button onClick={handleStartNewKYC} className="btn btn-primary" style={{ width: '100%' }}>
              <RotateCcw size={20} style={{ marginRight: '0.5rem' }} />
              {t('result.startNew')}
            </button>
          )}
        </div>
      </Card>

      <div
        style={{
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          textAlign: 'center',
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
        }}
      >
        {t('support.contact')}
      </div>
    </div>
  )
}

export default ResultPage
