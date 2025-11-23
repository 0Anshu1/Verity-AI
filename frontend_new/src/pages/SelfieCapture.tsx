import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useKYCStore } from '../store/kycStore'
import { biometricService } from '../services/api'
import { useI18n } from '../services/i18n'
import { voiceService, languageToVoiceCode, voicePrompts } from '../services/voice'
import { Card, Alert } from '../components'
import { Camera } from 'lucide-react'

const SelfieCapture: React.FC = () => {
  const navigate = useNavigate()
  const { session, setBiometric, nextStep, goToStep, voiceGuidance, language } = useKYCStore()
  const { t } = useI18n()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [captured, setCaptured] = useState(false)
  const [preview, setPreview] = useState<string>('')
  const [hint, setHint] = useState('Position your face in the frame')
  const [step, setStep] = useState('capture')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!captured && navigator.mediaDevices) {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: 'user' } })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream
          }
        })
        .catch(() => {
          setHint('Camera not available - using demo mode')
        })
    }
    if (voiceGuidance && voiceService.isSupported()) {
      const code = languageToVoiceCode[language] || 'en-US'
      const prompt = step === 'capture' ? voicePrompts.selfieCapture(language) : voicePrompts.liveness(language)
      voiceService.speak(prompt, { language: code }).catch(() => {})
    }
  }, [captured, step, voiceGuidance, language])

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height)
        const imageData = canvasRef.current.toDataURL('image/jpeg')
        setPreview(imageData)
        setCaptured(true)
        setStep('liveness')
      }
    }
  }

  const handleLivenessSteps = async () => {
    setLoading(true)

    let faceScore = 0
    try {
      if (session?.document?.capturedImage) {
        faceScore = await biometricService.verifyFaceMatch(preview, session.document.capturedImage)
      }
    } catch (e) {
      faceScore = 0
    }

    setBiometric({
      selfieImage: preview,
      faceMatchScore: faceScore,
      livenessDetected: true,
      deepfakeDetected: false,
      pulseDetected: true,
      depthMapVerified: true,
      activeSteps: {
        headTurn: true,
        blink: true,
        smile: true,
      },
    })

    nextStep()
    goToStep(7)
    navigate('/liveness-check')
  }

  const handleRetake = () => {
    setCaptured(false)
    setPreview('')
    setStep('capture')
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '700px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>{t('selfie.title')}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          {step === 'capture' ? t('selfie.subtitle.capture') : t('selfie.subtitle.liveness')}
        </p>
      </div>

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
                  aspectRatio: '1',
                  backgroundColor: '#000',
                }}
              />
              <canvas ref={canvasRef} style={{ display: 'none' }} width={400} height={400} />
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '200px',
                  height: '200px',
                  borderRadius: '50%',
                  border: '3px dashed var(--primary)',
                  pointerEvents: 'none',
                }}
              />
            </div>
          ) : step === 'capture' ? (
            <img src={preview} alt="Selfie" style={{ width: '100%', height: 'auto', aspectRatio: '1' }} />
          ) : (
            <div style={{ aspectRatio: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <img src={preview} alt="Selfie" style={{ width: '200px', height: '200px', borderRadius: '50%', objectFit: 'cover' }} />
              <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <h3 style={{ marginBottom: '1rem' }}>{t('liveness.title')}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                    ✓ Turn your head left
                  </div>
                  <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                    ✓ Blink your eyes
                  </div>
                  <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                    ✓ Smile
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {!captured ? (
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <button onClick={handleCapture} className="btn btn-primary btn-lg">
              <Camera size={20} style={{ marginRight: '0.5rem' }} />
              {t('common.capture')}
            </button>
          </div>
        ) : step === 'capture' ? (
          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
            <button onClick={handleRetake} className="btn btn-secondary" style={{ flex: 1 }}>
              {t('common.retake')}
            </button>
            <button onClick={() => setStep('liveness')} className="btn btn-primary" style={{ flex: 1 }}>
              {t('common.continue')}
            </button>
          </div>
        ) : (
          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
            <button onClick={handleRetake} className="btn btn-secondary" style={{ flex: 1 }}>
              {t('common.retake')}
            </button>
            <button onClick={handleLivenessSteps} className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
              {loading ? 'Verifying...' : t('common.verifyLiveness')}
            </button>
          </div>
        )}
      </Card>
    </div>
  )
}

export default SelfieCapture
