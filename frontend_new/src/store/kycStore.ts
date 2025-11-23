import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { KYCSession, UserInfo, PhoneVerification, DocumentData, BiometricData, GPSData, RiskAssessment } from '../types'

interface KYCStore {
  session: KYCSession | null;
  currentStep: number;
  darkMode: boolean;
  language: string;
  voiceGuidance: boolean;
  
  // Session actions
  createSession: () => void;
  setUserInfo: (info: UserInfo) => void;
  setPhoneVerification: (verification: PhoneVerification) => void;
  setDocument: (document: DocumentData) => void;
  setBiometric: (biometric: BiometricData) => void;
  setGPS: (gps: GPSData) => void;
  setRiskAssessment: (risk: RiskAssessment) => void;
  setSessionStatus: (status: 'pending' | 'approved' | 'rejected' | 'needs_review') => void;
  
  // Navigation
  goToStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  
  // Theme
  toggleDarkMode: () => void;
  setLanguage: (lang: string) => void;
  setVoiceGuidance: (enabled: boolean) => void;
  
  // Session management
  clearSession: () => void;
  resumeSession: () => void;
}

const createDefaultSession = (): KYCSession => ({
  id: Date.now().toString(),
  organizationId: 'org_default',
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

export const useKYCStore = create<KYCStore>()(
  persist(
    (set) => ({
      session: null,
      currentStep: 0,
  darkMode: false,
  language: 'en',
  voiceGuidance: false,

      createSession: () => {
        set({
          session: createDefaultSession(),
          currentStep: 0,
        })
      },

      setUserInfo: (info: UserInfo) => {
        set((state) => {
          if (!state.session) return state;
          return {
            session: {
              ...state.session,
              userInfo: info,
              updatedAt: new Date(),
            },
          };
        });
      },

      setPhoneVerification: (verification: PhoneVerification) => {
        set((state) => {
          if (!state.session) return state;
          return {
            session: {
              ...state.session,
              phoneVerification: verification,
              updatedAt: new Date(),
            },
          };
        });
      },

      setDocument: (document: DocumentData) => {
        set((state) => {
          if (!state.session) return state;
          return {
            session: {
              ...state.session,
              document,
              updatedAt: new Date(),
            },
          };
        });
      },

      setBiometric: (biometric: BiometricData) => {
        set((state) => {
          if (!state.session) return state;
          return {
            session: {
              ...state.session,
              biometric,
              updatedAt: new Date(),
            },
          };
        });
      },

      setGPS: (gps: GPSData) => {
        set((state) => {
          if (!state.session) return state;
          return {
            session: {
              ...state.session,
              gps,
              updatedAt: new Date(),
            },
          };
        });
      },

      setRiskAssessment: (risk: RiskAssessment) => {
        set((state) => {
          if (!state.session) return state;
          return {
            session: {
              ...state.session,
              riskAssessment: risk,
              updatedAt: new Date(),
            },
          };
        });
      },

      setSessionStatus: (status) => {
        set((state) => {
          if (!state.session) return state;
          return {
            session: {
              ...state.session,
              status,
              updatedAt: new Date(),
            },
          };
        });
      },

      goToStep: (step: number) => {
        set({ currentStep: step });
      },

      nextStep: () => {
        set((state) => ({
          currentStep: Math.min(state.currentStep + 1, 10),
        }));
      },

      previousStep: () => {
        set((state) => ({
          currentStep: Math.max(state.currentStep - 1, 0),
        }));
      },

      toggleDarkMode: () => {
        set((state) => {
          const newDarkMode = !state.darkMode;
          document.documentElement.classList.toggle('dark', newDarkMode);
          return { darkMode: newDarkMode };
        });
      },

      setLanguage: (lang: string) => {
        set({ language: lang });
      },

      setVoiceGuidance: (enabled: boolean) => {
        set({ voiceGuidance: enabled });
      },

      clearSession: () => {
        set({
          session: null,
          currentStep: 0,
        });
      },

      resumeSession: () => {
        // Load from localStorage if available
        set((state) => {
          if (state.session) {
            return {
              currentStep: state.session.currentStep,
            };
          }
          return state;
        });
      },
    }),
    {
      name: 'kyc-store',
      partialize: (state) => ({
        session: state.session,
        darkMode: state.darkMode,
        language: state.language,
        voiceGuidance: state.voiceGuidance,
      }),
    }
  )
)
