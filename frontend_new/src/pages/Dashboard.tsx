import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { LogOut, Plus, Search, Download, Filter, ChevronRight, CheckCircle, XCircle, Clock, Sun, Moon } from 'lucide-react'

interface KYCRecord {
  id: string
  name: string
  email: string
  status: 'approved' | 'rejected' | 'pending'
  createdAt: string
  riskScore: number
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const { user, organization, logout, toggleDarkMode, darkMode } = useAuthStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'rejected' | 'pending'>('all')

  // Mock KYC records for this organization
  const [records] = useState<KYCRecord[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      status: 'approved',
      createdAt: '2024-01-15',
      riskScore: 15,
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      status: 'pending',
      createdAt: '2024-01-18',
      riskScore: 42,
    },
    {
      id: '3',
      name: 'Bob Johnson',
      email: 'bob@example.com',
      status: 'approved',
      createdAt: '2024-01-10',
      riskScore: 8,
    },
    {
      id: '4',
      name: 'Alice Brown',
      email: 'alice@example.com',
      status: 'rejected',
      createdAt: '2024-01-05',
      riskScore: 89,
    },
  ])

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || record.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={18} style={{ color: '#22c55e' }} />
      case 'rejected':
        return <XCircle size={18} style={{ color: '#ef4444' }} />
      case 'pending':
        return <Clock size={18} style={{ color: '#f59e0b' }} />
      default:
        return null
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'rgba(34, 197, 94, 0.1)'
      case 'rejected':
        return 'rgba(239, 68, 68, 0.1)'
      case 'pending':
        return 'rgba(245, 158, 11, 0.1)'
      default:
        return 'var(--bg)'
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleStartKYC = () => {
    navigate('/welcome')
  }

  if (!user) {
    navigate('/')
    return null
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      color: 'var(--text)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        color: 'white',
        padding: '1.5rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Verity AI</h1>
          <p style={{ margin: '0.25rem 0 0 0', opacity: 0.9, fontSize: '0.875rem' }}>
            {organization?.name || 'Organization'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
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
            }}
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            onClick={handleLogout}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem',
            }}
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Welcome Section */}
          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: '1rem',
            padding: '1.5rem',
            marginBottom: '2rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          }}>
            <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem' }}>Welcome, {user.name}!</h2>
            <p style={{ margin: '0 0 1rem 0', color: 'var(--text-secondary)' }}>
              Manage KYC records and onboard new users for your organization
            </p>
            <button
              onClick={handleStartKYC}
              style={{
                background: '#2563eb',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Plus size={18} />
              Start New KYC Process
            </button>
          </div>

          {/* Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem',
          }}>
            {[
              { label: 'Total Records', value: records.length, color: '#3b82f6' },
              { label: 'Approved', value: records.filter(r => r.status === 'approved').length, color: '#22c55e' },
              { label: 'Pending', value: records.filter(r => r.status === 'pending').length, color: '#f59e0b' },
              { label: 'Rejected', value: records.filter(r => r.status === 'rejected').length, color: '#ef4444' },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  background: 'var(--bg-secondary)',
                  padding: '1.5rem',
                  borderRadius: '0.75rem',
                  borderLeft: `4px solid ${stat.color}`,
                }}
              >
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  {stat.label}
                </p>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '2rem', fontWeight: 'bold', color: stat.color }}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* Records Section */}
          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: '1rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            overflow: 'hidden',
          }}>
            {/* Toolbar */}
            <div style={{
              padding: '1.5rem',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap',
              alignItems: 'center',
            }}>
              <div style={{ flex: 1, minWidth: '250px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Search size={18} style={{ color: 'var(--text-secondary)' }} />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    flex: 1,
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--text)',
                    fontSize: '0.95rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  style={{
                    padding: '0.5rem 1rem',
                    border: '1px solid var(--border)',
                    background: 'var(--bg)',
                    color: 'var(--text)',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                  }}
                >
                  <option value="all">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>

                <button
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    color: 'var(--text)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <Download size={16} />
                  Export
                </button>
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
              }}>
                <thead>
                  <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      Name
                    </th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      Email
                    </th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      Status
                    </th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      Risk Score
                    </th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      Date
                    </th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.length > 0 ? (
                    filteredRecords.map((record) => (
                      <tr key={record.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '1rem' }}>{record.name}</td>
                        <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                          {record.email}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              padding: '0.5rem 1rem',
                              background: getStatusBadgeColor(record.status),
                              borderRadius: '0.5rem',
                              fontSize: '0.875rem',
                              fontWeight: 500,
                              textTransform: 'capitalize',
                            }}
                          >
                            {getStatusIcon(record.status)}
                            {record.status}
                          </div>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                          }}>
                            <div style={{
                              width: '100px',
                              height: '6px',
                              background: 'var(--bg)',
                              borderRadius: '3px',
                              overflow: 'hidden',
                            }}>
                              <div style={{
                                height: '100%',
                                width: `${Math.min(record.riskScore, 100)}%`,
                                background: record.riskScore > 50 ? '#ef4444' : '#22c55e',
                              }} />
                            </div>
                            <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                              {record.riskScore}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                          {new Date(record.createdAt).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          <button
                            style={{
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              color: 'var(--primary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <ChevronRight size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} style={{
                        padding: '2rem',
                        textAlign: 'center',
                        color: 'var(--text-secondary)',
                      }}>
                        No records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '1.5rem',
        color: 'var(--text-secondary)',
        fontSize: '0.875rem',
        borderTop: '1px solid var(--border)',
        background: 'var(--bg-secondary)',
      }}>
        © 2025 Verity AI. All rights reserved. | {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Account
      </footer>
    </div>
  )
}

export default Dashboard
