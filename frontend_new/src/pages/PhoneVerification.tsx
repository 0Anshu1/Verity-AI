import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useKYCStore } from '../store/kycStore'
import { phoneService } from '../services/api'
import { FormField, Card, LoadingSpinner, Alert } from '../components'
import { useI18n } from '../services/i18n'
import { voiceService, languageToVoiceCode, voicePrompts } from '../services/voice'

const PhoneVerification: React.FC = () => {
  const navigate = useNavigate()
  const { setPhoneVerification, nextStep, goToStep, session, voiceGuidance, language } = useKYCStore()
  const { t } = useI18n()
  const [step, setStep] = useState<'send' | 'verify'>('send')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [carrier, setCarrier] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (voiceGuidance && voiceService.isSupported()) {
      const code = languageToVoiceCode[language] || 'en-US'
      voiceService.speak(voicePrompts.phoneVerification(language), { language: code }).catch(() => {})
    }
  }, [voiceGuidance, language])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!/^\d{10,}$/.test(phone.replace(/\D/g, ''))) {
      setError('Please enter a valid phone number')
      return
    }

    setLoading(true)
    try {
      const result = await phoneService.sendOTP(phone, session?.userInfo?.email)
      if (result.success) {
        const carrierInfo = await phoneService.getCarrierInfo(phone)
        setCarrier(carrierInfo)
        setStep('verify')
        setCountdown(60)
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('Failed to send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!otp || otp.length < 6) {
      setError('Please enter a valid 6-digit OTP')
      return
    }

    setLoading(true)
    try {
      const result = await phoneService.verifyOTP(phone, otp)
      if (result.success) {
        setPhoneVerification({
          isVerified: true,
          otpSent: true,
          otpCode: otp,
          attempts: 1,
          carrierInfo: carrier,
        })
        nextStep()
        goToStep(3)
        navigate('/select-document')
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('Verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <Card>
        <h1 style={{ marginBottom: '0.5rem' }}>{t('phone.title')}</h1>
        <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>
          {step === 'send' ? t('phone.enter') : t('phone.otp')}
        </p>

        {error && <Alert type="error" title="Error" message={error} onClose={() => setError('')} />}

        {step === 'send' ? (
          <form onSubmit={handleSendOTP}>
            <FormField label={t('userinfo.phone')} required>
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ width: '100%' }}
              />
            </FormField>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button type="button" onClick={() => navigate('/user-info')} className="btn btn-secondary" style={{ flex: 1 }}>
                {t('common.back')}
              </button>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                {loading ? 'Sending...' : t('phone.send')}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP}>
            <div
              style={{
                backgroundColor: 'var(--bg)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Phone: {phone}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Carrier: {carrier || 'Detecting...'}
              </div>
            </div>

            <FormField label="OTP" required>
              <input
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                style={{ width: '100%', fontSize: '1.5rem', letterSpacing: '0.5rem', textAlign: 'center' }}
              />
            </FormField>

            {countdown > 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Resend OTP in {countdown}s
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button
                type="button"
                onClick={() => {
                  setStep('send')
                  setOtp('')
                }}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                {t('common.back')}
              </button>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                {loading ? 'Verifying...' : t('phone.verify')}
              </button>
            </div>
          </form>
        )}
      </Card>
    </div>
  )
}

export default PhoneVerification
