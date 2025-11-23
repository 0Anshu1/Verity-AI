import React from 'react'
import { CheckCircle, AlertCircle, XCircle, Info } from 'lucide-react'

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

  const colors = {
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

export default Alert
