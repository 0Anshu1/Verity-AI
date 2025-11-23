import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Zap, Lock, CheckCircle, Users, FileCheck, Smartphone, MapPin, ArrowRight, Building2 } from 'lucide-react'
import { useI18n } from '../services/i18n'

const Home: React.FC = () => {
  const navigate = useNavigate()

  const { t } = useI18n()

  const features = [
    {
      icon: <FileCheck size={32} />,
      title: t('home.feature.document.title'),
      description: t('home.feature.document.desc'),
    },
    {
      icon: <Smartphone size={32} />,
      title: t('home.feature.biometric.title'),
      description: t('home.feature.biometric.desc'),
    },
    {
      icon: <MapPin size={32} />,
      title: t('home.feature.location.title'),
      description: t('home.feature.location.desc'),
    },
    {
      icon: <Shield size={32} />,
      title: t('home.feature.risk.title'),
      description: t('home.feature.risk.desc'),
    },
  ]

  const benefits = [
    {
      icon: <Zap size={24} />,
      title: t('home.benefit.fast.title'),
      description: t('home.benefit.fast.desc'),
    },
    {
      icon: <Lock size={24} />,
      title: t('home.benefit.security.title'),
      description: t('home.benefit.security.desc'),
    },
    {
      icon: <CheckCircle size={24} />,
      title: t('home.benefit.accuracy.title'),
      description: t('home.benefit.accuracy.desc'),
    },
    {
      icon: <Users size={24} />,
      title: t('home.benefit.languages.title'),
      description: t('home.benefit.languages.desc'),
    },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <header style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
        color: 'white',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backdropFilter: 'blur(6px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 700 }}>
          <Shield size={24} />
          <span>Verity AI</span>
        </div>
        <nav style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => navigate('/auth')} style={{
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontWeight: 600
          }}>Organization Login</button>
        </nav>
      </header>

      {/* Hero Section */}
      <section style={{
        background: 'radial-gradient(1200px 400px at 50% -100px, rgba(37,99,235,0.25), transparent), linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
        color: 'white',
        padding: '6rem 2rem',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: 'bold',
            marginBottom: '1.5rem',
            lineHeight: '1.2',
            backgroundImage: 'linear-gradient(90deg, #93c5fd, #fff)',
            WebkitBackgroundClip: 'text',
            color: 'transparent'
          }}>
            Enterprise Identity Verification Platform
          </h1>
          <p style={{
            fontSize: '1.25rem',
            marginBottom: '2.5rem',
            opacity: 0.95,
            lineHeight: '1.6',
          }}>
            Streamline your KYC process with AI-powered verification. Trusted by organizations worldwide for secure, fast, and compliant identity verification.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <span style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', padding: '0.5rem 0.75rem', borderRadius: '999px', fontSize: '0.875rem' }}>GDPR Ready</span>
            <span style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', padding: '0.5rem 0.75rem', borderRadius: '999px', fontSize: '0.875rem' }}>Bank-grade Security</span>
            <span style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', padding: '0.5rem 0.75rem', borderRadius: '999px', fontSize: '0.875rem' }}>Global Coverage</span>
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/auth')}
              style={{
                background: 'white',
                color: '#1e3c72',
                padding: '1rem 2.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                fontSize: '1.125rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
              }}
            >
              <Building2 size={20} />
              Get Started for Organizations
            </button>
            <button
              onClick={() => navigate('/auth')}
              style={{
                background: 'transparent',
                color: 'white',
                padding: '1rem 2.5rem',
                borderRadius: '0.5rem',
                border: '2px solid white',
                fontSize: '1.125rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              Learn More
            </button>
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem', opacity: 0.9, flexWrap: 'wrap' }}>
            <span style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>FinTech</span>
            <span style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>Banking</span>
            <span style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>Crypto</span>
            <span style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>Telecom</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '5rem 2rem', background: 'var(--bg-secondary)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--text)' }}>
              {t('home.feature.document.title')}
            </h2>
            <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
              {t('home.feature.document.desc')}
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
          }}>
            {features.map((feature, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--bg)',
                  padding: '2rem',
                  borderRadius: '1rem',
                  border: '1px solid var(--border)',
                  boxShadow: '0 6px 24px rgba(0,0,0,0.06)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '999px', background: 'rgba(37,99,235,0.1)', color: '#2563eb', marginBottom: '1rem' }}>{feature.icon}</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text)' }}>
                  {feature.title}
                </h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section style={{ padding: '5rem 2rem', background: 'var(--bg)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--text)' }}>
              Verity AI
            </h2>
            <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
              {t('home.benefit.security.desc')}
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem',
          }}>
            {benefits.map((benefit, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  gap: '1.5rem',
                  padding: '1.5rem',
                  background: 'var(--bg-secondary)',
                  borderRadius: '0.75rem',
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ color: '#2563eb', flexShrink: 0 }}>
                  {benefit.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text)' }}>
                    {benefit.title}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '5rem 2rem',
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        color: 'white',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            {t('home.ready')}
          </h2>
          <p style={{ fontSize: '1.125rem', marginBottom: '2.5rem', opacity: 0.95 }}>
            {t('home.cta.desc')}
          </p>
          <button
            onClick={() => navigate('/auth')}
            style={{
              background: 'white',
              color: '#1e3c72',
              padding: '1rem 2.5rem',
              borderRadius: '0.5rem',
              border: 'none',
              fontSize: '1.125rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
            }}
          >
            {t('home.cta.button')}
            <ArrowRight size={20} />
          </button>
          <p style={{ marginTop: '1.5rem', fontSize: '0.875rem', opacity: 0.9 }}>
            Note: Individual customers cannot sign in. KYC verification is initiated by organizations for their customers.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: 'var(--bg-secondary)',
        padding: '3rem 2rem',
        borderTop: '1px solid var(--border)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
            marginBottom: '2rem',
          }}>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text)' }}>
                Verity AI
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.6' }}>
                Enterprise identity verification platform powered by AI and advanced security technologies.
              </p>
            </div>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text)' }}>
                Product
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>Features</li>
                <li style={{ marginBottom: '0.5rem' }}>Security</li>
                <li style={{ marginBottom: '0.5rem' }}>Compliance</li>
              </ul>
            </div>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text)' }}>
                Company
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>About</li>
                <li style={{ marginBottom: '0.5rem' }}>Contact</li>
                <li style={{ marginBottom: '0.5rem' }}>Privacy Policy</li>
              </ul>
            </div>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text)' }}>
                Support
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>Documentation</li>
                <li style={{ marginBottom: '0.5rem' }}>Help Center</li>
                <li style={{ marginBottom: '0.5rem' }}>support@verity-ai.com</li>
              </ul>
            </div>
          </div>
          <div style={{
            paddingTop: '2rem',
            borderTop: '1px solid var(--border)',
            textAlign: 'center',
            color: 'var(--text-secondary)',
            fontSize: '0.875rem',
          }}>
            © 2025 Verity AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home

