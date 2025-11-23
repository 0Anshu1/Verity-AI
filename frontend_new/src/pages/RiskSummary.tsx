import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useKYCStore } from '../store/kycStore'
import { useAuthStore } from '../store/authStore'
import { riskService, biometricService, documentService } from '../services/api'
import { Card, LoadingSpinner, Badge } from '../components'
import { useI18n } from '../services/i18n'
import { voiceService, languageToVoiceCode } from '../services/voice'
import { BarChart3, AlertCircle } from 'lucide-react'

const RiskSummary: React.FC = () => {
  const navigate = useNavigate()
  const { session, setRiskAssessment, setSessionStatus, nextStep, goToStep, voiceGuidance, language } = useKYCStore()
  const { t } = useI18n()
  const { user } = useAuthStore()
  
  // If user is null, this is a customer-facing view (no auth = customer)
  const isCustomerView = !user
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [riskData, setRiskData] = useState<any>(null)

  useEffect(() => {
    const calculateRisk = async () => {
      if (!session) {
        navigate('/')
        return
      }

      // Simulate gathering all verification scores
      const docScore = 94
      const faceScore = session.biometric?.faceMatchScore || 92
      const gpsScore = session.gps?.matchConfidence || 85
      const phoneVerified = session.phoneVerification?.isVerified || false

      const risk = await riskService.calculateRiskScore(docScore, faceScore, gpsScore, phoneVerified)
      setRiskData(risk)
      setRiskAssessment(risk)
      setLoading(false)
    }

    calculateRisk()
    if (voiceGuidance && voiceService.isSupported()) {
      const code = languageToVoiceCode[language] || 'en-US'
      voiceService.speak(t('risk.title'), { language: code }).catch(() => {})
    }
  }, [])

  const handleApprove = async () => {
    setProcessing(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setSessionStatus('approved')
    nextStep()
    goToStep(10)
    navigate('/result')
  }

  const handleReject = async () => {
    setProcessing(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setSessionStatus('rejected')
    nextStep()
    goToStep(10)
    navigate('/result')
  }

  if (loading) return <LoadingSpinner />

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'green':
        return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', text: 'Low Risk' }
      case 'amber':
        return { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', text: 'Medium Risk' }
      case 'red':
        return { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', text: 'High Risk' }
      default:
        return { bg: 'var(--bg)', color: 'var(--text)', text: 'Unknown' }
    }
  }

  const riskColor = getRiskColor(riskData?.riskLevel)

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>{t('risk.title')}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>{t('risk.subtitle')}</p>
      </div>

      <Card>
        <div
          style={{
            backgroundColor: riskColor.bg,
            borderRadius: 'var(--radius-lg)',
            padding: '2rem',
            textAlign: 'center',
            marginBottom: '2rem',
            borderLeft: `4px solid ${riskColor.color}`,
          }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
            <BarChart3 size={40} style={{ color: riskColor.color }} />
          </div>
          <h2 style={{ marginBottom: '0.5rem' }}>Overall Risk Score</h2>
          <div style={{ fontSize: '3rem', fontWeight: 700, color: riskColor.color, marginBottom: '0.5rem' }}>
            {riskData?.systemRiskScore?.toFixed(1)}
          </div>
          <div style={{ fontSize: '1.125rem', fontWeight: 600, color: riskColor.color, marginBottom: '1rem' }}>
            {riskColor.text}
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>{riskData?.explanation}</p>
        </div>

        {/* Score Breakdown - Only show to organizations */}
        {!isCustomerView && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Score Breakdown</h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
              }}
            >
              <div style={{ padding: '1rem', backgroundColor: 'var(--bg)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Document Authenticity
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>
                  {riskData?.documentAuthenticity?.toFixed(1)}%
                </div>
              </div>
              <div style={{ padding: '1rem', backgroundColor: 'var(--bg)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Face Match Score
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--secondary)' }}>
                  {riskData?.faceMatchScore?.toFixed(1)}%
                </div>
              </div>
              <div style={{ padding: '1rem', backgroundColor: 'var(--bg)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  GPS Match
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)' }}>
                  {riskData?.gpsMatch?.toFixed(1)}%
                </div>
              </div>
              <div style={{ padding: '1rem', backgroundColor: 'var(--bg)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Phone Verification
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--warning)' }}>
                  {riskData?.phoneVerification?.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Risk Factors - Only show to organizations */}
        {!isCustomerView && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Risk Factors Analysis</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {riskData?.factors?.map((factor: any, idx: number) => (
                <div
                  key={idx}
                  style={{
                    padding: '1rem',
                    backgroundColor: 'var(--bg)',
                    borderRadius: 'var(--radius-md)',
                    borderLeft: `4px solid ${
                      factor.score > 80 ? 'var(--success)' : factor.score > 60 ? 'var(--warning)' : 'var(--error)'
                    }`,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div style={{ fontWeight: 600 }}>{factor.name}</div>
                    <Badge text={`${factor.score.toFixed(0)}%`} color={factor.impact === 'high' ? 'primary' : 'success'} />
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {factor.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Decision Buttons - Only show to organizations */}
        {!isCustomerView && (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={handleReject} className="btn btn-secondary" style={{ flex: 1 }} disabled={processing}>
              {processing ? 'Processing...' : t('common.reject')}
            </button>
            <button
              onClick={handleApprove}
              className="btn btn-primary"
              style={{ flex: 1 }}
              disabled={processing || riskData?.riskLevel === 'red'}
            >
              {processing ? 'Processing...' : t('common.approve')}
            </button>
          </div>
        )}

        {/* Customer View - Show submission message */}
        {isCustomerView && (
          <div style={{
            padding: '1.5rem',
            background: 'rgba(59, 130, 246, 0.1)',
            borderRadius: '0.5rem',
            textAlign: 'center',
            marginTop: '2rem',
          }}>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
              {t('risk.customer.message')}
            </p>
            <button
              onClick={() => navigate('/result')}
              className="btn btn-primary"
              style={{ marginTop: '1.5rem', width: '100%' }}
            >
              {t('risk.customer.cta')}
            </button>
          </div>
        )}
      </Card>
    </div>
  )
}

export default RiskSummary
