import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useKYCStore } from '../store/kycStore'
import { gpsService } from '../services/api'
import { Card, LoadingSpinner, Alert } from '../components'
import { useI18n } from '../services/i18n'
import { voiceService, languageToVoiceCode, voicePrompts } from '../services/voice'
import { MapPin, CheckCircle, AlertCircle } from 'lucide-react'

const GPSCheck: React.FC = () => {
  const navigate = useNavigate()
  const { session, setGPS, nextStep, goToStep, voiceGuidance, language } = useKYCStore()
  const { t } = useI18n()
  const [loading, setLoading] = useState(true)
  const [requesting, setRequesting] = useState(false)
  const [gpsData, setGpsData] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (session?.gps) {
      setGpsData(session.gps)
      setLoading(false)
    }
    if (voiceGuidance && voiceService.isSupported()) {
      const code = languageToVoiceCode[language] || 'en-US'
      voiceService.speak(voicePrompts.gpsCheck(language), { language: code }).catch(() => {})
    }
  }, [])

  const handleRequestLocation = async () => {
    setRequesting(true)
    try {
      const location = await gpsService.getUserLocation()
      const match = await gpsService.matchAddressWithDocument(location.address, session?.userInfo?.address || '')

      const gpsInfo = {
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
        isMatched: match.isMatched,
        matchConfidence: match.confidence,
      }

      setGpsData(gpsInfo)
      setGPS(gpsInfo)
      setLoading(false)
    } catch (err) {
      setError('Failed to get location. Please try again.')
    } finally {
      setRequesting(false)
    }
  }

  const handleContinue = () => {
    nextStep()
    goToStep(9)
    navigate('/summary')
  }

  if (loading && !gpsData) {
    return (
      <div style={{ padding: '2rem', maxWidth: '700px', margin: '0 auto' }}>
        <Card>
          <div style={{ textAlign: 'center', paddingTop: '2rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📍</div>
            <h1 style={{ marginBottom: '1rem' }}>{t('gps.title')}</h1>
            <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>
              We need to verify your location matches your registered address
            </p>

            {error && <Alert type="error" title="Error" message={error} onClose={() => setError('')} />}

            <button onClick={handleRequestLocation} className="btn btn-primary btn-lg" disabled={requesting}>
              <MapPin size={20} style={{ marginRight: '0.5rem' }} />
              {requesting ? t('gps.getting') : t('gps.allow')}
            </button>
          </div>
        </Card>
      </div>
    )
  }

  const addressMatch = gpsData?.isMatched

  return (
    <div style={{ padding: '2rem', maxWidth: '700px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>{t('gps.title')}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>{t('gps.subtitle')}</p>
      </div>

      <Card>
        <div
          style={{
            backgroundColor: 'var(--bg)',
            borderRadius: 'var(--radius-md)',
            padding: '1.5rem',
            marginBottom: '2rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>GPS Coordinates</div>
            <div style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
              {gpsData?.latitude?.toFixed(4)}, {gpsData?.longitude?.toFixed(4)}
            </div>
          </div>
          <div style={{ marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            📍 {gpsData?.address}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem',
            backgroundColor: addressMatch ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
            borderLeft: `4px solid ${addressMatch ? 'var(--success)' : 'var(--warning)'}`,
            borderRadius: 'var(--radius-md)',
            marginBottom: '2rem',
          }}
        >
          <div>
            <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Address Verification</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              {addressMatch ? `${gpsData?.matchConfidence}% match with registered address` : 'Address mismatch detected'}
            </div>
          </div>
          {addressMatch ? (
            <CheckCircle size={24} color="var(--success)" />
          ) : (
            <AlertCircle size={24} color="var(--warning)" />
          )}
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => navigate('/liveness-check')} className="btn btn-secondary" style={{ flex: 1 }}>
            {t('common.back')}
          </button>
          <button onClick={handleContinue} className="btn btn-primary" style={{ flex: 1 }}>
            {t('common.continue')}
          </button>
        </div>
      </Card>
    </div>
  )
}

export default GPSCheck
