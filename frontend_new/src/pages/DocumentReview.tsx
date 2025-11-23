import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useKYCStore } from '../store/kycStore'
import { documentService } from '../services/api'
import { Card, LoadingSpinner, Badge } from '../components'
import { useI18n } from '../services/i18n'
import { voiceService, languageToVoiceCode, voicePrompts } from '../services/voice'
import { CheckCircle } from 'lucide-react'

const DocumentReview: React.FC = () => {
  const navigate = useNavigate()
  const { session, setDocument, nextStep, goToStep, voiceGuidance, language } = useKYCStore()
  const { t } = useI18n()
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    const processDocument = async () => {
      if (!session?.document?.capturedImage) {
        navigate('/capture-doc')
        return
      }

      setLoading(false)
      const ocr = await documentService.processOCR(session.document.capturedImage)
      setDocument({
        ...session.document,
        ocrExtraction: ocr,
      })
      if (voiceGuidance && voiceService.isSupported()) {
        const code = languageToVoiceCode[language] || 'en-US'
        voiceService.speak(t('document.review.title'), { language: code }).catch(() => {})
      }
    }

    processDocument()
  }, [])

  const handleContinue = async () => {
    setProcessing(true)
    await new Promise((resolve) => setTimeout(resolve, 800))

    nextStep()
    goToStep(6)
    navigate('/selfie')
  }

  if (loading) return <LoadingSpinner />

  const ocr = session?.document?.ocrExtraction

  return (
    <div style={{ padding: '2rem', maxWidth: '700px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>{t('document.review.title')}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>{t('document.review.subtitle')}</p>
      </div>

      <Card>
        <div style={{ marginBottom: '2rem' }}>
          {session?.document?.capturedImage && (
            <img
              src={session.document.capturedImage}
              alt="Document"
              style={{ width: '100%', borderRadius: 'var(--radius-md)' }}
            />
          )}
        </div>

        {ocr && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
              <div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  First Name
                </div>
                <div style={{ fontSize: '1.125rem', fontWeight: 600 }}>{ocr.firstName}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Last Name
                </div>
                <div style={{ fontSize: '1.125rem', fontWeight: 600 }}>{ocr.lastName}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Date of Birth
                </div>
                <div style={{ fontSize: '1.125rem', fontWeight: 600 }}>{ocr.dateOfBirth}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Document Number
                </div>
                <div style={{ fontSize: '1.125rem', fontWeight: 600 }}>{ocr.documentNumber}</div>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div style={{ fontWeight: 600 }}>OCR Confidence</div>
                <Badge text={`${ocr.confidence}%`} color="success" />
              </div>
              <div
                style={{
                  height: '8px',
                  backgroundColor: 'var(--border)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${ocr.confidence}%`,
                    backgroundColor: 'var(--success)',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>Document Validation</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {Object.entries(ocr.fields).map(([key, value]) => (
                  <div
                    key={key}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem',
                      backgroundColor: 'var(--bg)',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <div style={{ textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {value}
                      <CheckCircle size={18} color="var(--success)" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => navigate('/capture-doc')} className="btn btn-secondary" style={{ flex: 1 }}>
            Retake
          </button>
          <button onClick={handleContinue} className="btn btn-primary" style={{ flex: 1 }} disabled={processing}>
            {processing ? 'Processing...' : 'Continue →'}
          </button>
        </div>
      </Card>
    </div>
  )
}

export default DocumentReview
