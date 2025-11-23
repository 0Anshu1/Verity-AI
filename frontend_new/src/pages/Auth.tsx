import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { LogIn, LogOut, Moon, Sun, Globe } from 'lucide-react'
import type { Language } from '../types'

const AuthPage: React.FC = () => {
  const navigate = useNavigate()
  const { login, signup, user, organization, toggleDarkMode, darkMode } = useAuthStore()
  
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('demo@acme.com')
  const [password, setPassword] = useState('password123')
  const [orgName, setOrgName] = useState('Acme Corporation')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  const handleGoHome = () => {
    navigate('/')
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signup(email, password, orgName)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // If already logged in, show loading state while redirecting
  if (user) {
    return null
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <header style={{
        padding: '1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: 'white',
      }}>
        <div 
          style={{ fontSize: '1.5rem', fontWeight: 'bold', cursor: 'pointer' }}
          onClick={handleGoHome}
        >
          Verity AI
        </div>
        <button
          onClick={toggleDarkMode}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            padding: '0.5rem',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>

      {/* Main Content */}
      <main style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem',
      }}>
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: '1rem',
          padding: '2rem',
          width: '100%',
          maxWidth: '420px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}>
          <h1 style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '1.75rem' }}>
            {mode === 'login' ? 'Organization Sign In' : 'Create Organization Account'}
          </h1>
          <p style={{
            textAlign: 'center',
            color: 'var(--text-secondary)',
            marginBottom: '1rem',
            fontSize: '0.95rem',
          }}>
            {mode === 'login'
              ? 'Access your organization dashboard'
              : 'Set up your organization workspace'}
          </p>
          <div style={{
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            borderRadius: '0.5rem',
            padding: '0.75rem',
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            textAlign: 'center',
          }}>
            <strong>Note:</strong> Only organizations can sign in. Individual customers complete KYC through invitation links provided by their organization.
          </div>

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid #ef4444',
              color: '#fee2e2',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              marginBottom: '1rem',
              fontSize: '0.875rem',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={mode === 'login' ? handleLogin : handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {mode === 'signup' && (
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  Organization Name
                </label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="Your Company"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem',
                    background: 'var(--bg)',
                    color: 'var(--text)',
                    fontSize: '1rem',
                  }}
                />
              </div>
            )}

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--border)',
                  borderRadius: '0.5rem',
                  background: 'var(--bg)',
                  color: 'var(--text)',
                  fontSize: '1rem',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--border)',
                  borderRadius: '0.5rem',
                  background: 'var(--bg)',
                  color: 'var(--text)',
                  fontSize: '1rem',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.75rem',
                background: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontSize: '1rem',
              }}
            >
              <LogIn size={18} />
              {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
            <button
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login')
                setError('')
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: '0.95rem',
              }}
            >
              {mode === 'login'
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'}
            </button>
          </div>

          {/* Demo Credentials */}
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: 'var(--bg)',
            borderRadius: '0.5rem',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
          }}>
            <strong>Demo Credentials:</strong>
            <div style={{ marginTop: '0.5rem', lineHeight: '1.6' }}>
              Email: demo@acme.com
              <br />
              Password: password123
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '1.5rem',
        color: 'rgba(255,255,255,0.7)',
        fontSize: '0.875rem',
        borderTop: '1px solid rgba(255,255,255,0.1)',
      }}>
        © 2025 Verity AI. All rights reserved.
      </footer>
    </div>
  )
}

export default AuthPage
