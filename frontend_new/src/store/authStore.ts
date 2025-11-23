import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { KYCSession, UserInfo, PhoneVerification, DocumentData, BiometricData, GPSData, RiskAssessment } from '../types'

export interface Organization {
  id: string
  name: string
  email: string
  plan: 'starter' | 'business' | 'enterprise'
  createdAt: Date
  branding?: {
    primaryColor: string
    logo?: string
    companyName: string
  }
  settings?: {
    requiredDocuments: string[]
    requireGPS: boolean
    requireBiometric: boolean
    riskalgorithm: 'simple' | 'advanced'
  }
}

export interface AuthUser {
  id: string
  email: string
  name: string
  organizationId: string
  role: 'admin' | 'user' | 'reviewer'
  token: string
}

interface AuthStore {
  // Auth state
  user: AuthUser | null
  organization: Organization | null
  isAuthenticated: boolean
  
  // KYC session state
  session: KYCSession | null
  currentStep: number
  
  // UI state
  darkMode: boolean
  language: string
  voiceEnabled: boolean
  
  // Auth actions
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, orgName: string) => Promise<void>
  logout: () => void
  
  // Organization actions
  setOrganization: (org: Organization) => void
  
  // KYC session actions
  createSession: () => void
  setUserInfo: (info: UserInfo) => void
  setPhoneVerification: (verification: PhoneVerification) => void
  setDocument: (document: DocumentData) => void
  setBiometric: (biometric: BiometricData) => void
  setGPS: (gps: GPSData) => void
  setRiskAssessment: (risk: RiskAssessment) => void
  setSessionStatus: (status: 'pending' | 'approved' | 'rejected' | 'needs_review') => void
  
  // Navigation
  goToStep: (step: number) => void
  nextStep: () => void
  previousStep: () => void
  
  // Theme & Preferences
  toggleDarkMode: () => void
  setLanguage: (lang: string) => void
  setVoiceEnabled: (enabled: boolean) => void
  
  // Session management
  clearSession: () => void
  resumeSession: () => void
}

const createDefaultSession = (organizationId: string): KYCSession => ({
  id: Date.now().toString(),
  organizationId,
  status: 'pending',
  currentStep: 0,
  userInfo: null,
  phoneVerification: null,
  document: null,
  biometric: null,
  gps: null,
  riskAssessment: null,
  createdAt: new Date(),
  updatedAt: new Date(),
})

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // Auth state
      user: null,
      organization: null,
      isAuthenticated: false,
      
      // KYC session
      session: null,
      currentStep: 0,
      
      // UI state
      darkMode: false,
      language: 'en',
      voiceEnabled: false,

      login: async (email: string, password: string) => {
        const apiUrl = (window.location.hostname === 'localhost' ? 'http://localhost:8000' : window.location.origin)
        const res = await fetch(`${apiUrl}/api/v1/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ detail: 'Login failed' }))
          throw new Error(errorData.detail || 'Login failed')
        }
        const data = await res.json()
        
        const user: AuthUser = {
          id: data.user.id,
          email: data.user.email,
          name: email.split('@')[0],
          organizationId: data.user.organization_id,
          role: 'admin',
          token: data.access_token,
        }
        
        set({
          user,
          organization: { id: data.user.organization_id, name: '', email, plan: 'business', createdAt: new Date() },
          isAuthenticated: true,
        })
        
        // Store token in localStorage
        localStorage.setItem('auth_token', data.access_token)
        localStorage.setItem('user', JSON.stringify(user))
      },

      signup: async (email: string, password: string, orgName: string) => {
        const apiUrl = (window.location.hostname === 'localhost' ? 'http://localhost:8000' : window.location.origin)
        const res = await fetch(`${apiUrl}/api/v1/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, org_name: orgName }),
        })
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ detail: 'Signup failed' }))
          throw new Error(errorData.detail || 'Signup failed')
        }
        const data = await res.json()
        
        // After signup, login to get token
        const loginRes = await fetch(`${apiUrl}/api/v1/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
        
        if (!loginRes.ok) {
          const errorData = await loginRes.json().catch(() => ({ detail: 'Login after signup failed' }))
          throw new Error(errorData.detail || 'Login after signup failed')
        }
        const loginData = await loginRes.json()
        
        const user: AuthUser = {
          id: loginData.user.id,
          email: loginData.user.email,
          name: email.split('@')[0],
          organizationId: loginData.user.organization_id,
          role: 'admin',
          token: loginData.access_token,
        }
        
        set({
          user,
          organization: { id: loginData.user.organization_id, name: orgName, email, plan: 'starter', createdAt: new Date() },
          isAuthenticated: true,
        })
        
        localStorage.setItem('auth_token', loginData.access_token)
        localStorage.setItem('user', JSON.stringify(user))
      },

      logout: () => {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')
        set({
          user: null,
          organization: null,
          isAuthenticated: false,
          session: null,
          currentStep: 0,
        })
      },

      setOrganization: (org: Organization) => {
        set({ organization: org })
      },

      createSession: () => {
        set((state) => ({
          session: createDefaultSession(state.organization?.id || 'org_default'),
          currentStep: 0,
        }))
      },

      setUserInfo: (info: UserInfo) => {
        set((state) => {
          if (!state.session) return state
          return {
            session: {
              ...state.session,
              userInfo: info,
              updatedAt: new Date(),
            },
          }
        })
      },

      setPhoneVerification: (verification: PhoneVerification) => {
        set((state) => {
          if (!state.session) return state
          return {
            session: {
              ...state.session,
              phoneVerification: verification,
              updatedAt: new Date(),
            },
          }
        })
      },

      setDocument: (document: DocumentData) => {
        set((state) => {
          if (!state.session) return state
          return {
            session: {
              ...state.session,
              document,
              updatedAt: new Date(),
            },
          }
        })
      },

      setBiometric: (biometric: BiometricData) => {
        set((state) => {
          if (!state.session) return state
          return {
            session: {
              ...state.session,
              biometric,
              updatedAt: new Date(),
            },
          }
        })
      },

      setGPS: (gps: GPSData) => {
        set((state) => {
          if (!state.session) return state
          return {
            session: {
              ...state.session,
              gps,
              updatedAt: new Date(),
            },
          }
        })
      },

      setRiskAssessment: (risk: RiskAssessment) => {
        set((state) => {
          if (!state.session) return state
          return {
            session: {
              ...state.session,
              riskAssessment: risk,
              updatedAt: new Date(),
            },
          }
        })
      },

      setSessionStatus: (status) => {
        set((state) => {
          if (!state.session) return state
          return {
            session: {
              ...state.session,
              status,
              updatedAt: new Date(),
            },
          }
        })
      },

      goToStep: (step: number) => {
        set({ currentStep: step })
      },

      nextStep: () => {
        set((state) => ({
          currentStep: Math.min(state.currentStep + 1, 10),
        }))
      },

      previousStep: () => {
        set((state) => ({
          currentStep: Math.max(state.currentStep - 1, 0),
        }))
      },

      toggleDarkMode: () => {
        set((state) => {
          const newDarkMode = !state.darkMode
          document.documentElement.classList.toggle('dark', newDarkMode)
          return { darkMode: newDarkMode }
        })
      },

      setLanguage: (lang: string) => {
        set({ language: lang })
      },

      setVoiceEnabled: (enabled: boolean) => {
        set({ voiceEnabled: enabled })
      },

      clearSession: () => {
        set({
          session: null,
          currentStep: 0,
        })
      },

      resumeSession: () => {
        const token = localStorage.getItem('auth_token')
        const userJson = localStorage.getItem('user')
        if (token && userJson) {
          try {
            const user = JSON.parse(userJson) as AuthUser
            set({ user, isAuthenticated: true })
          } catch (e) {
            // Ignore parse errors
          }
        }
      },
    }),
    {
      name: 'kyc-auth-store',
      partialize: (state) => ({
        user: state.user,
        organization: state.organization,
        isAuthenticated: state.isAuthenticated,
        session: state.session,
        darkMode: state.darkMode,
        language: state.language,
        voiceEnabled: state.voiceEnabled,
      }),
    }
  )
)

// Legacy export for backward compatibility
export const useKYCStore = useAuthStore
