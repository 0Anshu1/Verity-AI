import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useKYCStore } from '../store/kycStore'
import { languagesService } from '../services/api'
import { useI18n } from '../services/i18n'
import { voiceService, languageToVoiceCode, voicePrompts } from '../services/voice'
import { LoadingSpinner, Card } from '../components'
import { Shield, Zap, Lock, CheckCircle } from 'lucide-react'
import type { Language } from '../types'

const Welcome: React.FC = () => {
  const navigate = useNavigate()
  const { createSession, goToStep, setLanguage, setVoiceGuidance, voiceGuidance } = useKYCStore()
  const { t, lang } = useI18n()
  const [languages, setLanguages] = useState<Language[]>([])
  const [selectedLang, setSelectedLang] = useState('en')
  const [loading, setLoading] = useState(true)
  const [localVoice, setLocalVoice] = useState(voiceGuidance)

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const langs = await languagesService.getLanguages()
        setLanguages(langs)
        setLoading(false)
      } catch (error) {
        setLoading(false)
      }
    }
    fetchLanguages()
  }, [])

  const handleStart = async () => {
    createSession()
    setLanguage(selectedLang)
    setVoiceGuidance(localVoice)
    if (localVoice && voiceService.isSupported()) {
      const code = languageToVoiceCode[selectedLang] || 'en-US'
      try { await voiceService.speak(voicePrompts.welcome(selectedLang), { language: code }) } catch {}
    }
    goToStep(1)
    navigate('/user-info')
  }

  if (loading) return <LoadingSpinner />

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{ marginBottom: '1rem', color: '#2563eb' }}>
          <Shield size={64} />
        </div>
        <h1 style={{ marginBottom: '1rem' }}>{t('welcome.title')}</h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)' }}>{t('welcome.subtitle')}</p>
      </div>

      <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', padding: '2rem', marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>{t('language.select')}</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          {languages.map((lang) => (
            <Card
              key={lang.code}
              selected={selectedLang === lang.code}
              onClick={() => setSelectedLang(lang.code)}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 600 }}>{lang.nativeName}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{lang.name}</div>
              </div>
            </Card>
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1rem',
            backgroundColor: 'var(--bg)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '2rem',
          }}
        >
          <input
            type="checkbox"
            id="voice"
            checked={localVoice}
            onChange={(e) => setLocalVoice(e.target.checked)}
            style={{ cursor: 'pointer' }}
          />
          <label htmlFor="voice" style={{ cursor: 'pointer', flex: 1 }}>
            {t('voice.enable')}
          </label>
        </div>

        <button onClick={handleStart} className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}>
          {t('start.button')}
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginTop: '2rem',
        }}
      >
        <Card>
          <div style={{ marginBottom: '0.5rem', color: '#2563eb' }}>
            <Zap size={32} />
          </div>
          <h3 style={{ marginBottom: '0.5rem' }}>{t('welcome.feature.fast')}</h3>
          <p style={{ fontSize: '0.875rem' }}>{t('welcome.feature.fast.desc')}</p>
        </Card>
        <Card>
          <div style={{ marginBottom: '0.5rem', color: '#2563eb' }}>
            <Lock size={32} />
          </div>
          <h3 style={{ marginBottom: '0.5rem' }}>{t('welcome.feature.secure')}</h3>
          <p style={{ fontSize: '0.875rem' }}>{t('welcome.feature.secure.desc')}</p>
        </Card>
        <Card>
          <div style={{ marginBottom: '0.5rem', color: '#2563eb' }}>
            <CheckCircle size={32} />
          </div>
          <h3 style={{ marginBottom: '0.5rem' }}>{t('welcome.feature.accurate')}</h3>
          <p style={{ fontSize: '0.875rem' }}>{t('welcome.feature.accurate.desc')}</p>
        </Card>
      </div>
    </div>
  )
}

export default Welcome
