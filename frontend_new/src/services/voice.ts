// Text-to-Speech Service using Web Speech API
const synth = window.speechSynthesis

interface VoiceOptions {
  language?: string
  rate?: number
  pitch?: number
  volume?: number
}

export const voiceService = {
  /**
   * Speak text in selected language
   */
  async speak(text: string, options: VoiceOptions = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!synth) {
        reject(new Error('Speech Synthesis not supported'))
        return
      }

      // Cancel any ongoing speech
      synth.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      
      // Set language
      if (options.language) {
        utterance.lang = options.language
      }

      // Set voice properties
      utterance.rate = options.rate || 1.0
      utterance.pitch = options.pitch || 1.0
      utterance.volume = options.volume || 1.0

      utterance.onend = () => resolve()
      utterance.onerror = () => reject(new Error('Speech synthesis error'))

      synth.speak(utterance)
    })
  },

  /**
   * Stop current speech
   */
  stop(): void {
    if (synth) {
      synth.cancel()
    }
  },

  /**
   * Check if speech synthesis is supported
   */
  isSupported(): boolean {
    return !!synth
  },

  /**
   * Get available voices (filtered by language code)
   */
  getVoices(lang?: string): SpeechSynthesisVoice[] {
    const voices = synth?.getVoices() || []
    if (lang) {
      return voices.filter(v => v.lang.startsWith(lang))
    }
    return voices
  },
}

/**
 * Language to voice code mapping
 */
export const languageToVoiceCode: Record<string, string> = {
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  it: 'it-IT',
  pt: 'pt-PT',
  ru: 'ru-RU',
  ja: 'ja-JP',
  zh: 'zh-CN',
  hi: 'hi-IN',
  ar: 'ar-SA',
  ko: 'ko-KR',
  nl: 'nl-NL',
  pl: 'pl-PL',
  tr: 'tr-TR',
  vi: 'vi-VN',
  th: 'th-TH',
  sv: 'sv-SE',
  id: 'id-ID',
  bn: 'bn-BD',
}

/**
 * Predefined voice prompts for KYC flow
 */
export const voicePrompts = {
  welcome: (language: string) => {
    const prompts: Record<string, string> = {
      'en': 'Welcome to Verity AI. Begin your identity verification process.',
      'es': 'Bienvenido a Verity AI. Inicia tu proceso de verificación de identidad.',
      'fr': 'Bienvenue chez Verity AI. Commencez votre processus de vérification d\'identité.',
      'de': 'Willkommen bei Verity AI. Starten Sie Ihren Identitätsverifizierungsprozess.',
      'hi': 'Verity AI में आपका स्वागत है। अपनी पहचान सत्यापन प्रक्रिया शुरू करें।',
      'pt': 'Bem-vindo ao Verity AI. Inicie seu processo de verificação de identidade.',
      'it': 'Benvenuto in Verity AI. Inizia il tuo processo di verifica dell\'identità.',
      'ar': 'مرحبا بك في Verity AI. ابدأ عملية التحقق من الهوية الخاصة بك.',
    }
    return prompts[language] || prompts['en']
  },

  userInfo: (language: string) => {
    const prompts: Record<string, string> = {
      'en': 'Please provide your personal information. Enter your full name, date of birth, phone number, and address.',
      'es': 'Proporcione su información personal. Ingrese su nombre completo, fecha de nacimiento, número de teléfono y dirección.',
      'fr': 'Veuillez fournir vos informations personnelles. Entrez votre nom complet, date de naissance, numéro de téléphone et adresse.',
      'hi': 'कृपया अपनी व्यक्तिगत जानकारी प्रदान करें। अपना पूरा नाम, जन्म तिथि, फोन नंबर और पता दर्ज करें।',
    }
    return prompts[language] || prompts['en']
  },

  phoneVerification: (language: string) => {
    const prompts: Record<string, string> = {
      'en': 'We will now verify your phone number. An OTP code will be sent to you.',
      'es': 'Ahora verificaremos su número de teléfono. Se le enviará un código OTP.',
      'fr': 'Nous allons maintenant vérifier votre numéro de téléphone. Un code OTP vous sera envoyé.',
      'hi': 'हम अब आपके फोन नंबर को सत्यापित करेंगे। आपको एक OTP कोड भेजा जाएगा।',
    }
    return prompts[language] || prompts['en']
  },

  documentCapture: (language: string) => {
    const prompts: Record<string, string> = {
      'en': 'Please capture a clear photo of your document. Make sure the document is well-lit and all text is visible.',
      'es': 'Por favor, capture una foto clara de su documento. Asegúrese de que el documento esté bien iluminado y que todo el texto sea visible.',
      'fr': 'Veuillez prendre une photo claire de votre document. Assurez-vous que le document est bien éclairé et que tout le texte est visible.',
      'hi': 'कृपया अपने दस्तावेज़ की एक स्पष्ट तस्वीर लें। सुनिश्चित करें कि दस्तावेज़ अच्छी तरह से प्रकाशित है और सभी पाठ दृश्यमान है।',
    }
    return prompts[language] || prompts['en']
  },

  selfieCapture: (language: string) => {
    const prompts: Record<string, string> = {
      'en': 'Now we need to capture your selfie. Please look directly at the camera and make sure your face is clearly visible.',
      'es': 'Ahora necesitamos capturar su selfie. Por favor, mire directamente a la cámara y asegúrese de que su cara sea claramente visible.',
      'fr': 'Maintenant, nous devons capturer votre selfie. Veuillez regarder directement la caméra et assurez-vous que votre visage est clairement visible.',
      'hi': 'अब हमें आपका सेल्फी लेना है। कृपया सीधे कैमरे की ओर देखें और सुनिश्चित करें कि आपका चेहरा स्पष्ट रूप से दिखाई दे।',
    }
    return prompts[language] || prompts['en']
  },

  documentSelection: (language: string) => {
    const prompts: Record<string, string> = {
      'en': 'Please select the type of document you wish to verify.',
      'es': 'Seleccione el tipo de documento que desea verificar.',
      'fr': 'Veuillez sélectionner le type de document que vous souhaitez vérifier.',
      'hi': 'कृपया उस दस्तावेज़ प्रकार का चयन करें जिसे आप सत्यापित करना चाहते हैं।',
    }
    return prompts[language] || prompts['en']
  },

  liveness: (language: string) => {
    const prompts: Record<string, string> = {
      'en': 'Please perform the following actions. Turn your head left, blink your eyes, and smile. This verifies you are a real person.',
      'es': 'Por favor, realice las siguientes acciones. Gire la cabeza hacia la izquierda, parpadee y sonría. Esto verifica que es una persona real.',
      'fr': 'Veuillez effectuer les actions suivantes. Tournez votre tête vers la gauche, clignez des yeux et souriez. Cela vérifie que vous êtes une personne réelle.',
      'hi': 'कृपया निम्नलिखित क्रियाएं करें। अपना सिर बाईं ओर घुमाएं, अपनी आंखें झपकाएं, और मुस्कुराएं। यह सत्यापित करता है कि आप एक वास्तविक व्यक्ति हैं।',
    }
    return prompts[language] || prompts['en']
  },

  gpsCheck: (language: string) => {
    const prompts: Record<string, string> = {
      'en': 'We need to verify your current location. Please allow access to your GPS location.',
      'es': 'Necesitamos verificar su ubicación actual. Por favor, permita el acceso a su ubicación GPS.',
      'fr': 'Nous devons vérifier votre position actuelle. Veuillez autoriser l\'accès à votre localisation GPS.',
      'hi': 'हमें आपके वर्तमान स्थान को सत्यापित करना है। कृपया आपके जीपीएस स्थान तक पहुंच की अनुमति दें।',
    }
    return prompts[language] || prompts['en']
  },

  completion: (language: string) => {
    const prompts: Record<string, string> = {
      'en': 'Your identity verification is complete. Your application is being reviewed.',
      'es': 'Su verificación de identidad está completa. Su solicitud está siendo revisada.',
      'fr': 'Votre vérification d\'identité est terminée. Votre candidature est en cours d\'examen.',
      'hi': 'आपकी पहचान सत्यापन पूरा हो गया है। आपकी आवेदन की समीक्षा की जा रही है।',
    }
    return prompts[language] || prompts['en']
  },
}
