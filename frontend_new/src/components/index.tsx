import React from 'react'
import '../styles/global.css'
import { CheckCircle, AlertCircle, XCircle, Info } from 'lucide-react'

// Alert Component
interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  onClose?: () => void
}

export const Alert: React.FC<AlertProps> = ({ type, title, message, onClose }) => {
  const icons = {
    success: <CheckCircle size={24} />,
    error: <XCircle size={24} />,
    warning: <AlertCircle size={24} />,
    info: <Info size={24} />,
  }

  const colors: Record<string, { bg: string; border: string; text: string }> = {
    success: { bg: 'rgba(16, 185, 129, 0.1)', border: '#10b981', text: '#d1fae5' },
    error: { bg: 'rgba(239, 68, 68, 0.1)', border: '#ef4444', text: '#fee2e2' },
    warning: { bg: 'rgba(245, 158, 11, 0.1)', border: '#f59e0b', text: '#fef3c7' },
    info: { bg: 'rgba(14, 165, 233, 0.1)', border: '#0ea5e9', text: '#cffafe' },
  }

  const color = colors[type]

  return (
    <div
      style={{
        backgroundColor: color.bg,
        border: `2px solid ${color.border}`,
        borderRadius: 'var(--radius-lg)',
        padding: '1rem',
        display: 'flex',
        gap: '1rem',
        marginBottom: '1rem',
        color: color.text,
      }}
    >
      <div>{icons[type]}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{title}</div>
        <div style={{ fontSize: '0.875rem' }}>{message}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          ✕
        </button>
      )}
    </div>
  )
}

export const ProgressBar: React.FC<{ currentStep: number; totalSteps: number }> = ({
  currentStep,
  totalSteps,
}) => {
  const percentage = ((currentStep + 1) / totalSteps) * 100

  return (
    <div style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)' }}>
      <div
        style={{
          width: '100%',
          height: '4px',
          backgroundColor: 'var(--bg-tertiary)',
          borderRadius: '2px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: 'var(--primary)',
            transition: 'width 0.3s ease',
          }}
        />
      </div>
      <div
        style={{
          marginTop: '0.5rem',
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          textAlign: 'center',
        }}
      >
        Step {currentStep + 1} of {totalSteps}
      </div>
    </div>
  )
}

export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizes = { sm: '20px', md: '40px', lg: '60px' }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem',
      }}
    >
      <div
        style={{
          width: sizes[size],
          height: sizes[size],
          border: '4px solid var(--bg-tertiary)',
          borderTop: '4px solid var(--primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}
      />
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  )
}

export const FormField: React.FC<{
  label: string
  error?: string
  children: React.ReactNode
  required?: boolean
}> = ({ label, error, children, required = false }) => {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <label
        style={{
          display: 'block',
          marginBottom: '0.5rem',
          fontWeight: 500,
          color: 'var(--text)',
        }}
      >
        {label}
        {required && <span style={{ color: 'var(--error)' }}> *</span>}
      </label>
      {children}
      {error && (
        <div
          style={{
            marginTop: '0.5rem',
            fontSize: '0.875rem',
            color: 'var(--error)',
          }}
        >
          {error}
        </div>
      )}
    </div>
  )
}

export const Card: React.FC<{ children: React.ReactNode; onClick?: () => void; selected?: boolean }> = ({
  children,
  onClick,
  selected = false,
}) => {
  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: 'var(--bg-secondary)',
        border: selected ? '2px solid var(--primary)' : '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        boxShadow: selected ? '0 0 0 3px rgba(99, 102, 241, 0.1)' : 'var(--shadow-md)',
      }}
    >
      {children}
    </div>
  )
}

export const Badge: React.FC<{
  text: string
  color?: 'primary' | 'success' | 'warning' | 'error'
  size?: 'sm' | 'md'
}> = ({ text, color = 'primary', size = 'md' }) => {
  const colors = {
    primary: { bg: 'rgba(99, 102, 241, 0.1)', text: '#c7d2fe' },
    success: { bg: 'rgba(16, 185, 129, 0.1)', text: '#d1fae5' },
    warning: { bg: 'rgba(245, 158, 11, 0.1)', text: '#fef3c7' },
    error: { bg: 'rgba(239, 68, 68, 0.1)', text: '#fee2e2' },
  }

  const sizes = {
    sm: { padding: '0.25rem 0.75rem', fontSize: '0.75rem' },
    md: { padding: '0.5rem 1rem', fontSize: '0.875rem' },
  }

  return (
    <span
      style={{
        backgroundColor: colors[color].bg,
        color: colors[color].text,
        borderRadius: 'var(--radius-md)',
        ...sizes[size],
        display: 'inline-block',
        fontWeight: 500,
      }}
    >
      {text}
    </span>
  )
}

export const Modal: React.FC<{
  isOpen: boolean
  title: string
  onClose: () => void
  children: React.ReactNode
}> = ({ isOpen, title, onClose, children }) => {
  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>{title}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: 'var(--text)',
            }}
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
