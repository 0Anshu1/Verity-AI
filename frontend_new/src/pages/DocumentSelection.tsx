import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useKYCStore } from '../store/kycStore'
import { documentTypesService } from '../services/api'
import { useI18n } from '../services/i18n'
import { voiceService, languageToVoiceCode, voicePrompts } from '../services/voice'
import { Card, LoadingSpinner } from '../components'
import type { DocumentType } from '../types'

const DocumentSelection: React.FC = () => {
  const navigate = useNavigate()
  const { setDocument, nextStep, goToStep, voiceGuidance, language } = useKYCStore()
  const { t } = useI18n()
  const [documents, setDocuments] = useState<DocumentType[]>([])
  const [selectedDoc, setSelectedDoc] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const docs = await documentTypesService.getDocumentTypes()
        setDocuments(docs)
        setLoading(false)
      } catch (error) {
        setLoading(false)
      }
    }
    fetchDocuments()
    if (voiceGuidance && voiceService.isSupported()) {
      const code = languageToVoiceCode[language] || 'en-US'
      voiceService.speak(voicePrompts.documentSelection(language), { language: code }).catch(() => {})
    }
  }, [])

  const handleSelect = async (docId: string) => {
    setSelectedDoc(docId)
    const selectedDocument = documents.find((d) => d.id === docId)

    if (selectedDocument) {
      setDocument({
        type: docId as any,
        capturedImage: null,
        ocrExtraction: null,
        isConfirmed: false,
        captureAttempts: 0,
      })
      nextStep()
      goToStep(4)
      setTimeout(() => navigate('/capture-doc'), 300)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>{t('document.selection.title')}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>{t('document.selection.subtitle')}</p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {documents.map((doc) => (
          <Card key={doc.id} selected={selectedDoc === doc.id} onClick={() => handleSelect(doc.id)}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{doc.icon}</div>
            <h3 style={{ marginBottom: '0.5rem' }}>{doc.name}</h3>
            <p style={{ fontSize: '0.875rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
              {doc.description}
            </p>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <div>{t('document.validFor')} {doc.validityYears} years</div>
              <div>{t('document.availableIn')} {doc.countries.length} countries</div>
            </div>
          </Card>
        ))}
      </div>

      <div style={{ marginTop: '2rem' }}>
        <button onClick={() => navigate('/verify-phone')} className="btn btn-secondary">
          ← {t('common.back')}
        </button>
      </div>
    </div>
  )
}

export default DocumentSelection
