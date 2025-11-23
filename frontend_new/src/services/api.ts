import type { DocumentType, OCRExtraction, RiskAssessment, RiskFactor } from '../types'
const API_BASE = (window.location.hostname === 'localhost' ? 'http://localhost:8000' : window.location.origin)

function dataUrlToFile(dataUrl: string, filename: string): File {
  const arr = dataUrl.split(',')
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg'
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], filename, { type: mime })
}

// Mock delay helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Document Types Service
export const documentTypesService = {
  async getDocumentTypes(): Promise<DocumentType[]> {
    await delay(500)
    return [
      {
        id: 'passport',
        name: 'Passport',
        description: 'International travel document',
        icon: '🛂',
        countries: ['US', 'UK', 'IN', 'CA', 'AU'],
        validityYears: 10,
      },
      {
        id: 'aadhar',
        name: 'Aadhaar Card',
        description: 'Indian unique identification',
        icon: '🆔',
        countries: ['IN'],
        validityYears: 10,
      },
      {
        id: 'license',
        name: 'Driving License',
        description: 'Government-issued driver ID',
        icon: '🚗',
        countries: ['US', 'UK', 'IN', 'CA', 'AU'],
        validityYears: 5,
      },
      {
        id: 'utility',
        name: 'Utility Bill',
        description: 'Proof of address',
        icon: '📄',
        countries: ['US', 'UK', 'IN', 'CA', 'AU'],
        validityYears: 1,
      },
      {
        id: 'national_id',
        name: 'National ID',
        description: 'Government-issued national identification',
        icon: '📋',
        countries: ['US', 'UK', 'IN', 'CA', 'AU'],
        validityYears: 10,
      },
    ]
  },
}

// Phone Verification Service
export const phoneService = {
  async sendOTP(phone: string, email?: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/api/v1/otp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, email }),
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  },

  async getCarrierInfo(phone: string): Promise<string> {
    await delay(600)
    const carriers = ['Verizon', 'AT&T', 'T-Mobile', 'Sprint', 'Jio', 'Airtel', 'Vodafone']
    return carriers[Math.floor(Math.random() * carriers.length)]
  },

  async verifyOTP(phone: string, otp: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/api/v1/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp }),
    })
    const text = await res.text()
    if (!res.ok) throw new Error(text)
    return JSON.parse(text)
  },
}

// Document Processing Service
export const documentService = {
  async processOCR(imageData: string): Promise<OCRExtraction> {
    const form = new FormData()
    form.append('file', dataUrlToFile(imageData, 'document.jpg'))
    const res = await fetch(`${API_BASE}/api/v1/ai/ocr`, { method: 'POST', body: form })
    if (!res.ok) throw new Error(await res.text())
    const data = await res.json()
    const nameParts = (data.full_name || '').split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''
    return {
      documentNumber: data.document_number || '',
      firstName,
      lastName,
      dateOfBirth: data.date_of_birth || '',
      issueDate: '',
      expiryDate: data.expiry_date || '',
      country: '',
      confidence: Math.round((data.confidence || 0) * 100),
      fields: {
        RawText: data.raw_text || 'N/A',
        SecurityFeatures: 'Pending',
      },
    }
  },

  async validateDocumentAuthenticity(imageData: string, ocrData: OCRExtraction): Promise<number> {
    await delay(1500)
    // Mock authenticity score (0-100)
    return 94 + Math.random() * 5
  },
}

// Biometric Service
export const biometricService = {
  async verifyFaceMatch(selfieImage: string, documentImage: string): Promise<number> {
    const form = new FormData()
    form.append('selfie', dataUrlToFile(selfieImage, 'selfie.jpg'))
    form.append('document_face', dataUrlToFile(documentImage, 'document.jpg'))
    const res = await fetch(`${API_BASE}/api/v1/ai/face/verify`, { method: 'POST', body: form })
    if (!res.ok) throw new Error(await res.text())
    const data = await res.json()
    return Math.round((data.confidence || 0) * 100)
  },

  async checkLiveness(videoData: string): Promise<{
    livenessDetected: boolean;
    deepfakeDetected: boolean;
    pulseDetected: boolean;
    depthMapVerified: boolean;
  }> {
    const form = new FormData()
    form.append('video', dataUrlToFile(videoData, 'liveness.jpg'))
    const res = await fetch(`${API_BASE}/api/v1/ai/liveness`, { method: 'POST', body: form })
    if (!res.ok) throw new Error(await res.text())
    const data = await res.json()
    return {
      livenessDetected: !!data.is_live,
      deepfakeDetected: false,
      pulseDetected: !!data.is_live,
      depthMapVerified: !!data.is_live,
    }
  },
}

// GPS Service
export const gpsService = {
  async getUserLocation(): Promise<{ latitude: number; longitude: number; address: string }> {
    await delay(800)
    // Mock GPS coordinates (San Francisco)
    return {
      latitude: 37.7749,
      longitude: -122.4194,
      address: '123 Market Street, San Francisco, CA 94105, USA',
    }
  },

  async matchAddressWithDocument(
    gpsAddress: string,
    documentAddress: string
  ): Promise<{ isMatched: boolean; confidence: number }> {
    await delay(600)
    return {
      isMatched: true,
      confidence: 89,
    }
  },
}

// Risk Assessment Service
export const riskService = {
  async calculateRiskScore(
    documentScore: number,
    faceMatchScore: number,
    gpsMatch: number,
    phoneVerified: boolean
  ): Promise<RiskAssessment> {
    await delay(1000)

    const phoneScore = phoneVerified ? 95 : 40

    // Calculate risk factors
    const factors: RiskFactor[] = [
      {
        name: 'Document Authenticity',
        score: documentScore,
        impact: 'high',
        description: `Document passed ${documentScore > 90 ? 'all' : 'most'} authenticity checks`,
      },
      {
        name: 'Face Match Score',
        score: faceMatchScore,
        impact: 'high',
        description: `${faceMatchScore > 90 ? 'High' : 'Moderate'} confidence in facial match`,
      },
      {
        name: 'Liveness Detection',
        score: 98,
        impact: 'high',
        description: 'Active liveness confirmed with pulse detection',
      },
      {
        name: 'GPS Address Verification',
        score: gpsMatch * 1.11,
        impact: 'medium',
        description: `Address ${gpsMatch > 85 ? 'matches' : 'partially matches'} with GPS location`,
      },
      {
        name: 'Phone Verification',
        score: phoneScore,
        impact: 'medium',
        description: `Phone number ${phoneVerified ? 'verified' : 'not verified'}`,
      },
      {
        name: 'Device & Network Analysis',
        score: 92,
        impact: 'low',
        description: 'Device and network patterns appear legitimate',
      },
    ]

    // Calculate weighted average
    const weights = [0.25, 0.25, 0.15, 0.15, 0.1, 0.1]
    const systemRiskScore =
      factors.reduce((sum, factor, idx) => sum + factor.score * weights[idx], 0) / 100 * 100

    let riskLevel: 'green' | 'amber' | 'red' = 'red'
    if (systemRiskScore >= 85) riskLevel = 'green'
    else if (systemRiskScore >= 60) riskLevel = 'amber'

    let explanation = ''
    if (riskLevel === 'green') {
      explanation = 'All verification checks passed successfully. User qualifies for straight-through processing.'
    } else if (riskLevel === 'amber') {
      explanation = 'Some verification factors require manual review. Recommend additional verification steps.'
    } else {
      explanation = 'Verification failed key security checks. Recommend rejection or additional investigation.'
    }

    return {
      documentAuthenticity: documentScore,
      faceMatchScore,
      gpsMatch,
      phoneVerification: phoneScore,
      systemRiskScore,
      riskLevel,
      factors,
      explanation,
    }
  },
}

// Languages Service
export const languagesService = {
  async getLanguages() {
    await delay(300)
    return [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'es', name: 'Spanish', nativeName: 'Español' },
      { code: 'fr', name: 'French', nativeName: 'Français' },
      { code: 'de', name: 'German', nativeName: 'Deutsch' },
      { code: 'it', name: 'Italian', nativeName: 'Italiano' },
      { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
      { code: 'ru', name: 'Russian', nativeName: 'Русский' },
      { code: 'ja', name: 'Japanese', nativeName: '日本語' },
      { code: 'zh', name: 'Chinese', nativeName: '中文' },
      { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
      { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
      { code: 'ko', name: 'Korean', nativeName: '한국어' },
      { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
      { code: 'pl', name: 'Polish', nativeName: 'Polski' },
      { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
    ]
  },
}
