import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useKYCStore } from '../store/kycStore'
import { Card, Alert } from '../components'
import { useI18n } from '../services/i18n'
import { voiceService, languageToVoiceCode, voicePrompts } from '../services/voice'
import { Camera, RotateCw } from 'lucide-react'

const DocumentCapture: React.FC = () => {
  const navigate = useNavigate()
  const { setDocument, nextStep, goToStep, voiceGuidance, language } = useKYCStore()
  const { t } = useI18n()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [captured, setCaptured] = useState(false)
  const [preview, setPreview] = useState<string>('')
  const [hint, setHint] = useState('Position document in frame')
  const [blurDetected, setBlurDetected] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!captured && navigator.mediaDevices) {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: 'environment' } })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream
          }
        })
        .catch(() => {
          // Fallback for demo
          setHint('Camera not available - using demo mode')
        })
    }
    if (voiceGuidance && voiceService.isSupported()) {
      const code = languageToVoiceCode[language] || 'en-US'
      voiceService.speak(voicePrompts.documentCapture(language), { language: code }).catch(() => {})
    }
  }, [captured])

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height)
        const imageData = canvasRef.current.toDataURL('image/jpeg')
        setPreview(imageData)
        setCaptured(true)
        setHint('Image captured')
      }
    }
  }

  const handleConfirm = async () => {
    setLoading(true)
    // Simulate OCR processing
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setDocument({
      type: 'passport',
      capturedImage: preview,
      ocrExtraction: null,
      isConfirmed: true,
      captureAttempts: 1,
    })

    nextStep()
    goToStep(5)
    navigate('/review-doc')
  }

  const handleRetake = () => {
    setCaptured(false)
    setPreview('')
    setHint('Position document in frame')
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '700px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>{t('document.capture.title')}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>{t('document.capture.subtitle')}</p>
      </div>

      {blurDetected && (
        <Alert type="warning" title={t('capture.blurry')} message={t('capture.blurry.desc')} />
      )}

      <Card>
        <div style={{ position: 'relative', backgroundColor: 'var(--bg)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          {!captured ? (
            <div>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{
                  width: '100%',
                  aspectRatio: '4/3',
                  backgroundColor: '#000',
                }}
              />
              <canvas ref={canvasRef} style={{ display: 'none' }} width={400} height={300} />
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '80%',
                  aspectRatio: '16/9',
                  border: '3px dashed var(--primary)',
                  borderRadius: 'var(--radius-lg)',
                  pointerEvents: 'none',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '1rem',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  color: 'white',
                  textAlign: 'center',
                  fontSize: '0.875rem',
                }}
              >
                {hint}
              </div>
            </div>
          ) : (
            <img src={preview} alt="Captured" style={{ width: '100%', height: 'auto' }} />
          )}
        </div>

        {!captured ? (
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <button onClick={handleCapture} className="btn btn-primary btn-lg">
              <Camera size={20} style={{ marginRight: '0.5rem' }} />
              {t('common.capture')}
            </button>
          </div>
        ) : (
          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
            <button onClick={handleRetake} className="btn btn-secondary" style={{ flex: 1 }}>
              <RotateCw size={20} style={{ marginRight: '0.5rem' }} />
              {t('common.retake')}
            </button>
            <button onClick={handleConfirm} className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
              {loading ? 'Processing...' : t('document.confirm')}
            </button>
          </div>
        )}
      </Card>
    </div>
  )
}

export default DocumentCapture
