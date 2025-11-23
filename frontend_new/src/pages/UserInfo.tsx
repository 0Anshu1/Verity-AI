import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useKYCStore } from '../store/kycStore'
import { FormField, Card } from '../components'
import { useI18n } from '../services/i18n'
import { voiceService, languageToVoiceCode, voicePrompts } from '../services/voice'
import type { UserInfo as UserInfoType } from '../types'

const UserInfo: React.FC = () => {
  const navigate = useNavigate()
  const { setUserInfo, nextStep, goToStep, voiceGuidance, language } = useKYCStore()
  const { t } = useI18n()
  const [formData, setFormData] = useState<UserInfoType>({
    fullName: '',
    dateOfBirth: '',
    phone: '',
    email: '',
    address: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  React.useEffect(() => {
    if (voiceGuidance && voiceService.isSupported()) {
      const code = languageToVoiceCode[language] || 'en-US'
      voiceService.speak(voicePrompts.userInfo(language), { language: code }).catch(() => {})
    }
  }, [voiceGuidance, language])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required'
    }
    if (!formData.phone || !/^\d{10,}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Valid phone number is required'
    }
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800))

    setUserInfo(formData)
    nextStep()
    goToStep(2)
    navigate('/verify-phone')
  }

  const handleBack = () => {
    navigate('/')
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <Card>
        <h1 style={{ marginBottom: '0.5rem' }}>{t('userinfo.title')}</h1>
        <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>{t('userinfo.subtitle')}</p>

        <form onSubmit={handleSubmit}>
          <FormField label={t('userinfo.fullname')} error={errors.fullName} required>
            <input
              type="text"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              style={{ width: '100%' }}
            />
          </FormField>

          <FormField label={t('userinfo.dob')} error={errors.dateOfBirth} required>
            <input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              style={{ width: '100%' }}
            />
          </FormField>

          <FormField label={t('userinfo.phone')} error={errors.phone} required>
            <input
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              style={{ width: '100%' }}
            />
          </FormField>
          
          <FormField label={t('userinfo.email')} error={errors.email}>
            <input
              type="email"
              placeholder="john.doe@example.com"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              style={{ width: '100%' }}
            />
          </FormField>

          <FormField label={t('userinfo.address')} error={errors.address} required>
            <textarea
              placeholder="123 Main Street, City, State ZIP"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              style={{ width: '100%', minHeight: '100px' }}
            />
          </FormField>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" onClick={handleBack} className="btn btn-secondary" style={{ flex: 1 }}>
              {t('common.back')}
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
              {loading ? 'Processing...' : t('common.continue')}
            </button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default UserInfo
