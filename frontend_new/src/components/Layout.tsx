import React, { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useKYCStore } from '../store/kycStore'
import { ProgressBar } from './index'
import { Menu, Moon, Sun } from 'lucide-react'

const Layout: React.FC = () => {
  const navigate = useNavigate()
  const { currentStep, darkMode, toggleDarkMode } = useKYCStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const STEPS = [
    { num: 0, name: 'Welcome', path: '/' },
    { num: 1, name: 'User Info', path: '/user-info' },
    { num: 2, name: 'Phone Verification', path: '/verify-phone' },
    { num: 3, name: 'Select Document', path: '/select-document' },
    { num: 4, name: 'Capture Document', path: '/capture-doc' },
    { num: 5, name: 'Review Document', path: '/review-doc' },
    { num: 6, name: 'Selfie', path: '/selfie' },
    { num: 7, name: 'Liveness Check', path: '/liveness-check' },
    { num: 8, name: 'GPS Check', path: '/gps-check' },
    { num: 9, name: 'Risk Summary', path: '/summary' },
    { num: 10, name: 'Result', path: '/result' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      {/* Header */}
      <header
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border)',
          padding: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ cursor: 'pointer', fontSize: '1.5rem', fontWeight: 700 }} onClick={() => navigate('/')}>
          🔐 Verity-AI
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            onClick={toggleDarkMode}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text)',
              padding: '0.5rem',
            }}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text)',
              padding: '0.5rem',
              display: 'none',
            }}
            className="mobile-menu-btn"
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      {/* Progress Bar */}
      <ProgressBar currentStep={currentStep} totalSteps={STEPS.length} />

      {/* Main Content */}
      <main style={{ flex: 1, overflow: 'auto' }}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border)',
          padding: '1rem',
          textAlign: 'center',
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
        }}
      >
        © 2025 Verity-AI. All rights reserved. | Privacy Policy | Terms of Service
      </footer>

      <style>
        {`
          @media (max-width: 768px) {
            .mobile-menu-btn {
              display: block !important;
            }
          }
        `}
      </style>
    </div>
  )
}

export default Layout
