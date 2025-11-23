import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useKYCStore } from '../store/kycStore'
import { biometricService } from '../services/api'
import { useI18n } from '../services/i18n'
import { voiceService, languageToVoiceCode, voicePrompts } from '../services/voice'
import { Card, LoadingSpinner, Badge } from '../components'
import { CheckCircle, AlertCircle } from 'lucide-react'

const LivenessCheck: React.FC = () => {
  const navigate = useNavigate()
  const { session, nextStep, goToStep, voiceGuidance, language } = useKYCStore()
  const { t } = useI18n()
  const [loading, setLoading] = useState(true)
  const [livenessData, setLivenessData] = useState<any>(null)

  useEffect(() => {
    const performLivenessCheck = async () => {
      if (!session?.biometric?.selfieImage) {
        navigate('/selfie')
        return
      }

      const data = await biometricService.checkLiveness(session.biometric.selfieImage)
      setLivenessData(data)
      setLoading(false)
    }

    performLivenessCheck()
    if (voiceGuidance && voiceService.isSupported()) {
      const code = languageToVoiceCode[language] || 'en-US'
      voiceService.speak(voicePrompts.liveness(language), { language: code }).catch(() => {})
    }
  }, [])

  const handleContinue = () => {
    nextStep()
    goToStep(8)
    navigate('/gps-check')
  }

  if (loading) return <LoadingSpinner />

  const checks = [
    {
      name: 'Liveness Detected',
      status: livenessData?.livenessDetected,
      description: 'Real person verified with active liveness detection',
    },
    {
      name: 'Pulse Detection',
      status: livenessData?.pulseDetected,
      description: 'Pulse pattern detected via PPG analysis',
    },
    {
      name: 'Deepfake Detection',
      status: !livenessData?.deepfakeDetected,
      description: 'No synthetic media artifacts detected',
    },
    {
      name: 'Depth Map Verified',
      status: livenessData?.depthMapVerified,
      description: '3D depth information confirmed',
    },
  ]

  const allPassed = checks.every((c) => c.status)

  return (
    <div style={{ padding: '2rem', maxWidth: '700px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>{t('liveness.title')}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>{t('liveness.subtitle')}</p>
      </div>

      <Card>
        <div style={{ marginBottom: '2rem' }}>
          <div
            style={{
              backgroundColor: allPassed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
              {allPassed ? '✓' : '✗'}
            </div>
            <h2 style={{ marginBottom: '0.5rem' }}>
              {allPassed ? t('liveness.confirmed') : t('liveness.failed')}
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              {allPassed
                ? t('liveness.confirmed.desc')
                : t('liveness.failed.desc')}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
          {checks.map((check, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                backgroundColor: 'var(--bg)',
                borderRadius: 'var(--radius-md)',
                borderLeft: `4px solid ${check.status ? 'var(--success)' : 'var(--error)'}`,
              }}
            >
              <div>
                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{check.name}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {check.description}
                </div>
              </div>
              {check.status ? (
                <CheckCircle size={24} color="var(--success)" />
              ) : (
                <AlertCircle size={24} color="var(--error)" />
              )}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          {!allPassed && (
            <button onClick={() => navigate('/selfie')} className="btn btn-secondary" style={{ flex: 1 }}>
              {t('selfie.retake')}
            </button>
          )}
          <button
            onClick={handleContinue}
            className="btn btn-primary"
            style={{ flex: allPassed ? 1 : 1 }}
            disabled={!allPassed}
          >
            {t('common.continue')}
          </button>
        </div>
      </Card>
    </div>
  )
}

export default LivenessCheck
